import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <SignIn routing="path" path="/sign-in" redirectUrl="/post-auth" />
    </div>
  );
};

export default SignInPage;


