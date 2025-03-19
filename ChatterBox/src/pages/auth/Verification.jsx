import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import { ResendOTP, VerifyOTP } from "../../redux/slices/auth";

// schema

const otpSchema = yup.object().shape({
  otp: yup
    .array()
    .of(yup.string().matches(/^\d$/, "Must be a digit"))
    .length(4, 'OTP must be exactly 4 digits')
    .required("OTP is required"),
})

const Verification = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { control, handleSubmit, setValue, getValues, formState: { errors, isSubmitting } } =
    useForm({
      resolver: yupResolver(otpSchema),
      defaultValues: {
        otp: ["", "", "", ""]
      }
    })

  const { isLoading } = useSelector((state) => state.auth);

  const [resendDisabled, setResendDisabled] = useState(true);
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef([]);

  const email = new URLSearchParams(location.search).get("email")



  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus() //automatically focus on the first input
    }
  }, [])

  // Timer effect for diabling the resend button

  useEffect(() => {
    if (resendDisabled) {
      const intervalId = setInterval(() => {
        setTimer((prev) => {
          if (prev > 0) return prev - 1;
          setResendDisabled(false); // Enable the resend button when timer hits 0
        })
      }, 1000);

      return () => clearInterval(intervalId)   // ensures memory is free before this component unmounts
    }
  }, [resendDisabled])

  const handleChangeInput = (e, index) => {
    const value = e.target.value;
    if (/^\d$/.test(value)) {
      // valid digit input or not
      console.log(value, 'otp value')
      setValue(`otp[${index}]`, value, { shouldValidate: true });
      if (index < 3) {
        inputRefs.current[index + 1]?.focus() // move focus to the next input
      }
      
      }
      else if (value === "") {
        // Handle backspace key
        setValue(`otp[${index}]`, "");
        if (index > 0 && e.nativeEvent.inputType === 'deleteContentBackward') {
          inputRefs.current[index - 1]?.focus() // shift focus to previous input
        }
    }
  }

  const onSubmit = (data) => {
    const otp = data.otp.join(""); // combine the 4 digits into one string

    try {
      dispatch(VerifyOTP({ email, otp }, navigate))
    } catch (error) {
      console.log(error, "Verification Failed");
    }
  }

  const handleResendOTP = async () => {
    // Reset the timer and disable the button
    setResendDisabled(true);
    setTimer(60);
    try {
      dispatch(ResendOTP(email));
      console.log("OTP Resent successfully");
    } catch (error) {
      console.log("Error resending OTP:", error);
    }
  }

  return (
    <div className="overflow-hidden px-4 dark:bg-boxdark-2 sm:px-8">
      <div className="flex h-screen flex-col items-center justify-center overflow-hidden">
        <div className="no-scrollbar overflow-y-auto py-20">
          <div className="mx-auto w-full max-w-[480px]">
            <div className="text-center">
              <Link to="/" className="mx-auto mb-10 inline-flex">
                <Logo />
              </Link>

              <div className="bg-white p-4 shadow-14 rounded-xl dark:bg-boxdark lg:p-7.5 xl:p-12.5">
                <h1 className="mb-2.5 text-3xl font-black leading-[48px] text-black dark:text-white capitalize">
                  Verify your account
                </h1>

                <p className="mb-7.5 font-medium">
                  Enter the 4 digit code sent to registered email id.
                </p>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="flex items-center gap-4.5 ">
                    {Array.from({ length: 4 }).map((_, index) => (
                      
                      <Controller key={index} name={`otp[${index}]`} control={control} render={({ field }) => (
                        <input
                          {...field}
                          ref={(el) => (inputRefs.current[index] = el)} // Assign refs to inputs
                          type="text"
                          maxLength="1"
                          className="w-full rounded-md border-[1.5px] border-stroke bg-transparent px-5 py-3 text-center text-black outline-none transition focus:border-strokedark active:border-form-strokedark  disabled: cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                          onChange={(e) => handleChangeInput(e, index)}
                          onKeyDown={(e) => {
                            if(e.key === "Backspace" && getValues(`otp[${index}]`) === ""){
                                // shift focus to previous input if empty on backspace
                                inputRefs.current[index-1]?.focus();
                            }
                          } }
                        />
                      )}
                      />
                    ))}
                  </div>

                  {errors.otp && <p className="mt-2 text-red">{errors.otp.message}</p>}

                  <p className="mb-5 mt-4 text-left font-medium text-black dark:text-white space-x-2 flex flex-row items-center">
                    <div>Did not recieve a code?</div>
                    <button 
                    type="button" 
                    onClick={handleResendOTP} 
                    disabled={resendDisabled}
                     className={`${resendDisabled ? "text-body" : "text-primary"}`}>
                      Resend {resendDisabled && `(${timer}s)`}
                    </button>
                  </p>

                  <button type="submit" disabled={isLoading || isSubmitting} className="flex w-full justify-center rounded-md bg-primary p-[13px] font-bold text-gray hover:bg-opacity-90">

                    {isLoading || isSubmitting ? "Submitting..." : "Verify"}
                  </button>

                  <span className="mt-5 block text-red">
                    Don&apos;t share the verification code with anyone!
                  </span>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verification;
