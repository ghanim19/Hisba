// pages/auth/error.js
import { useRouter } from 'next/router';

function ErrorPage() {
  const router = useRouter();
  const { error } = router.query;

  let errorMessage;
  switch (error) {
    case 'CredentialsSignin':
      errorMessage = 'Sign in failed. Check the details you provided are correct.';
      break;
    case 'SessionRequired':
      errorMessage = 'You need to be authenticated to access this page.';
      break;
    default:
      errorMessage = 'An unexpected error occurred.';
  }

  return (
    <div>
      <h1>Error</h1>
      <p>{errorMessage}</p>
    </div>
  );
}

export default ErrorPage;
