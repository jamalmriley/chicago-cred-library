export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.GOTO_CLIENT_ID!,
    response_type: "code",
    redirect_uri: process.env.GOTO_REDIRECT_URI!,
    scope: "messaging.v1.send",
  });

  return Response.redirect(
    `https://authentication.logmeininc.com/oauth/authorize?${params}`,
  );
}
