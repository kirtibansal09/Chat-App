import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UserOne from "../../assets/images/user/user-01.png";
import { Camera } from "@phosphor-icons/react";
import SelectInput from "../../components/Form/SelectInput";
import {
  fetchUserProfile,
  updateUserProfile,
  updateUserAvatar,
} from "../../redux/slices/user";

export default function ProfileForm() {
  const dispatch = useDispatch();
  const { currentUser, loading } = useSelector((state) => state.user);
  const authToken = useSelector((state) => state.auth.token); // ✅ fetch token from redux

  const [formData, setFormData] = useState({
    name: "",
    jobTitle: "",
    bio: "",
    country: "",
  });
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    if (authToken) {
      dispatch(fetchUserProfile(authToken));
    }
  }, [dispatch, authToken]);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        jobTitle: currentUser.jobTitle || "",
        bio: currentUser.bio || "",
        country: currentUser.country || "",
      });
      setAvatarPreview(currentUser.avatar || "");
    }
  }, [currentUser]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authToken) {
      alert("No auth token found.");
      return;
    }
    await dispatch(updateUserProfile(formData, authToken));
    alert("Profile updated!");
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (!authToken) {
        alert("No auth token found.");
        return;
      }
      await dispatch(updateUserAvatar(reader.result, authToken));
      setAvatarPreview(reader.result);
      alert("Avatar updated!");
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="flex flex-col w-full p-4 space-y-6">
      {/* Avatar */}
      <div className="relative z-30 w-full rounded-full p-1 backdrop-blur sm:max-w-36 sm:p-3">
        <div className="relative drop-shadow-2">
          <img
            src={avatarPreview || UserOne}
            alt="Profile"
            className="rounded-full object-center object-cover"
          />
          <label
            htmlFor="profile"
            className="absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-primary text-white hover:bg-opacity-90 sm:bottom-2 sm:right-2 p-2"
          >
            <Camera size={20} />
            <input
              type="file"
              id="profile"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarChange}
            />
          </label>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark md:max-w-150">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-5.5 p-6.5">
            <InputField
              label="Name"
              value={formData.name}
              onChange={(val) => handleChange("name", val)}
            />
            <InputField
              label="Job Title"
              value={formData.jobTitle}
              onChange={(val) => handleChange("jobTitle", val)}
            />
            <InputField
              label="Bio"
              value={formData.bio}
              onChange={(val) => handleChange("bio", val)}
            />
            <SelectInput
              selected={formData.country}
              onChange={(val) => handleChange("country", val)}
            />
            <button
              type="submit"
              className="w-full cursor-pointer rounded-lg border border-primary bg-primary py-3 px-6 text-white transition hover:bg-opacity-90"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-3 block text-black dark:text-white">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter your ${label.toLowerCase()}`}
        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
      />
    </div>
  );
}
