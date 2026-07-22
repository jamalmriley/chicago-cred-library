interface EmailTemplateProps {
  firstName: string;
}

export function CheckoutReceipt({ firstName }: EmailTemplateProps) {
  return (
    <div>
      <h1>Your library receipt 📚</h1>
      <p>Hi, {firstName}!</p>
      <p>
        Thanks for visiting the Chicago CRED Library. Below is a receipt for
        your checked out books.
      </p>
    </div>
  );
}
