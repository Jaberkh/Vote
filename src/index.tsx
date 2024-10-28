import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Button, Frog } from 'frog';
import { devtools } from 'frog/dev';
import { setupDatabase, loadVotes, saveVotes } from './database'; 
import { neynar } from 'frog/hubs';

export const app = new Frog({
  title: 'Voting Frame',
  imageAspectRatio: '1:1',
  hub: neynar({ apiKey: '8CC4FE87-3950-4481-BAD2-20475D7F7B68' }),
  verify: 'silent',
});

// بارگذاری پایگاه داده
const db = await setupDatabase();

// بارگذاری آرای اولیه
let votes = await loadVotes(db); 

app.use('/*', serveStatic({ root: './public' }));

// صفحه اصلی
app.frame('/', async (c) => {
  const { status, buttonValue, verified } = c;

  if (!verified) {
    console.log('Frame verification failed');
  }

  const hasSelected = buttonValue === 'vote';
  const showThirdPage = buttonValue === 'harris' || buttonValue === 'trump';

  const imageUrl = showThirdPage 
    ? 'https://i.imgur.com/HZG1uOl.png' 
    : hasSelected 
    ? 'https://i.imgur.com/be4kQO3.png' 
    : 'https://i.imgur.com/bLVqRNb.png'; 

  // بررسی دکمه‌های رای‌گیری و ذخیره‌سازی رای‌ها
  if (buttonValue === 'harris') {
    votes.harris += 1;
  } else if (buttonValue === 'trump') {
    votes.trump += 1;
  }

  // ذخیره رای‌ها به صورت غیرهمزمان
  await saveVotes(db, votes);

  const totalVotes = votes.harris + votes.trump;
  const harrisPercent = totalVotes ? Math.round((votes.harris / totalVotes) * 100) : 0;
  const trumpPercent = totalVotes ? Math.round((votes.trump / totalVotes) * 100) : 0;

  return c.res({
    image: (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: showThirdPage ? 'black' : hasSelected ? 'black' : (status === 'response' ? 'linear-gradient(to right, #432889, #17101F)' : 'black'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <img
          src={imageUrl}
          alt={showThirdPage ? "Thank you for voting!" : hasSelected ? "Next page image" : "Main page image"}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            fontSize: 90,
            fontWeight: 'bold',
            fontFamily: 'Arial',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            whiteSpace: 'pre-wrap',
            display: 'flex',
            gap: '335px',
          }}
        >
          {showThirdPage 
            ? <>
                <span>{trumpPercent}</span> 
                <span>{harrisPercent}</span>
              </>
            : hasSelected 
            ? "" 
            : ""}
        </div>
      </div>
    ),
    intents: showThirdPage
      ? [
          <Button.AddCastAction action={`/share-composer?text=Thank you for voting! Harris: ${votes.harris} votes, Trump: ${votes.trump} votes.`}>
            Share Vote
          </Button.AddCastAction>,
          <Button action="https://warpcast.com/jeyloo">Follow Me</Button>,
        ]
      : hasSelected
      ? [
          <Button value="harris">Harris</Button>,
          <Button value="trump">Trump</Button>,
        ]
      : [
          <Button value="vote">Vote</Button>,
        ],
  });
});

// Composer Action برای ایجاد کست
app.composerAction(
  '/share-composer',
  (c) => {
    const message = `Thank you for voting! Harris: ${votes.harris} votes, Trump: ${votes.trump} votes.`;
    return c.res({
      title: 'Share Your Vote',
      url: `https://warpcast.com/compose?text=${encodeURIComponent(message)}`,
    });
  },
  {
    name: 'Share Vote',
    description: 'Share the results',
    icon: 'megaphone',
    imageUrl: 'https://example.com/logo.png',
  }
);

// Start the server
const port = 3000;
console.log(`Server is running on port ${port}`);

devtools(app, { serveStatic });

serve({
  fetch: app.fetch,
  port,
});
