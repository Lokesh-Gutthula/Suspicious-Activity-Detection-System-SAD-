const ChangePassword = () => {
    return (
      <div className="max-w-md mx-auto p-10 bg-white shadow-lg rounded-xl mt-10">
        <h2 className="text-3xl font-bold mb-6">Change Password</h2>
        <form>
          <input type="password" placeholder="Old Password" className="input" />
          <input type="password" placeholder="New Password" className="input mt-4" />
          <button className="btn mt-6">Change Password</button>
        </form>
      </div>
    );
  };
  
  export default ChangePassword;
  