import * as SparkPost from 'sparkpost';
const client = new SparkPost(process.env.SPARKPOST_API_KEY);

export const sendConfirmationEmail = async (recipientEmail: string, url: string) => {
  const response = await client.transmissions.send({
    options: {
      sandbox: true
    },
    content: {
      from: 'testing@sparkpostbox.com',
      subject: 'Confirm Email',
      html: `<html>
      <body>
      <p>Testing SparkPost - the world\'s most awesomest email service!</p>
      <a href='${url}'>Confirm Email</a>
      </body>
      </html>`
    },
    recipients: [
      { address: `${recipientEmail}` }
    ]
  })
  return null;
}