import { Link } from "react-router-dom";
import Logo from "../../components/Logo";
import LoginIllustration from "../../assets/images/auth/login.svg";
import { EnvelopeSimple } from "@phosphor-icons/react";

function Login() {
  return (
    <div className="border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark h-screen">
      <div className="flex flex-wrap items-center h-full">
        {/* Left Part */}
        <div className="hidden w-full xl:block xl:w-1/2">
          <div className="py-17.5 px-26 text-center">
            <Link className="mb-5.5 inline-block">
              <Logo />
            </Link>

            <p>
              Hey There, Welcome Back. Login to chat with your friends &
              colleagues.
            </p>

            <span className="mt-15 inline-block">
              <img
                src={LoginIllustration}
                alt="login"
                className="h-100 w-auto object-cover object-center"
              />
            </span>
          </div>
        </div>

        {/* Right Part */}
        <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2 xl:px-24">
          <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
            <span className="mb-1.5 block font-medium">Start for free</span>
            <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
              Sign In to ChatterBox
            </h2>

            <form action="">
              <div className="mb-4">
                <label
                  htmlFor=""
                  className="mb-2.5 block font-medium text-black dark:text-white"
                >
                  Email
                </label>

                <div className="relative">
                    <input type="email" placeholder="Enter your email" className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-slate-500 focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary "/>

                    <span className="absolute right-4 top-4">
                        <EnvelopeSimple size={24}/>
                    </span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
