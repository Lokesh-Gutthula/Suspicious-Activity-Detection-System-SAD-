const ResetPassword = () => {
    return (
      <div className="max-w-md mx-auto p-10 bg-white shadow-lg rounded-xl mt-10">
        <h2 className="text-3xl font-bold mb-6">Reset Password</h2>
        <form>
          <input type="email" placeholder="Enter your email" className="input" />
          <button className="btn mt-4">Send OTP</button>
          <input type="text" placeholder="Enter OTP" className="input mt-4" />
          <input type="password" placeholder="New Password" className="input mt-4" />
          <button className="btn mt-6">Reset Password</button>
        </form>
      </div>
    );
  };
  
  export default ResetPassword;
  