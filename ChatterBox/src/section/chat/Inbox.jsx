import User03 from "../../assets/images/user/user-03.png";
import {
  Gif,
  LinkSimple,
  Microphone,
  PaperPlaneTilt,
  Phone,
  Smiley,
  VideoCamera,
} from "@phosphor-icons/react";
import Dropdown from "../../components/Dropdown";
import EmojiPicker from "../../components/EmojiPicker";
import { useState } from "react";
import UserInfo from "./UserInfo";
import Giphy from "../../components/Giphy";
import { useDispatch } from "react-redux";
import { ToggleAudioModal } from "../../redux/slices/app";
import Attachment from "../../components/Attachment";
import MsgSeparator from "../../components/MsgSeparator";
import TypingIndicator from "../../components/TypingIndicator";
import {
  DocumentMessage,
  MediaMessage,
  TextMessage,
  VoiceMessage,
} from "../../components/Messages";
import VideoRoom from "../../components/VideoRoom";

const Inbox = () => {
  const dispatch = useDispatch();
  const [userInfoOpen, setUserInfoOpen] = useState(false);

  const [gifOpen, setGifOpen] = useState(false);

  const [videoCall, setVideoCall] = useState(false);
  const [audioCall, setAudioCall] = useState(false);

  const handleToggleVideo = () => {
    setVideoCall((p) => !p);
  }

  const handleToggleAudio = () => {
    setAudioCall((p) => !p);
  }

  const handleToggleGif = (e) => {
    e.preventDefault();
    setGifOpen((prev) => !prev);
  };

  const handleToggleUserInfo = () => {
    setUserInfoOpen((prev) => !prev);
  };

  const handleMicClick = (e) => {
    e.preventDefault();

    dispatch(ToggleAudioModal(true));
  };

  return (
    <>
      <div
        className={`flex h-full flex-col border-l border-stroke dark:border-strokedark ${
          userInfoOpen ? "xl:w-1/2" : "xl:w-3/4"
        } `}
      >
        {/* Chat Header */}
        <div className="sticky flex flex-row border-stroke dark:border-strokedark border-b items-center justify-between px-6 py-4.5">
          <div
            className="flex items-center cursor-pointer"
            onClick={handleToggleUserInfo}
          >
            <div className="mr-4.5 h-13 overflow-hidden w-full max-w-13 rounded-full">
              <img
                src={User03}
                alt="avatar"
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div>
              <h5 className="font-medium text-black dark:text-white">
                Robert Jhon
              </h5>
              <p className="text-sm">Reply to message</p>
            </div>
          </div>

          <div className="flex flex-row items-center space-x-8">
            <button onClick={handleToggleVideo}>
              <VideoCamera size={24} />
            </button>
            <button onClick={handleToggleAudio}>
              <Phone size={24} />
            </button>
            <Dropdown />
          </div>
        </div>

        {/* List of messages */}
        <div className="max-h-full space-y-3.5 overflow-auto no-scrollbar px-6 py-7.5 grow">
          <TextMessage
            author="Rahul Vashishtha"
            content="Hello. This is my first message https://www.npmjs.com "
            read_receipt="read"
            incoming={true}
            timestamp="2:44AM"
          />

          <div className="max-w-125 ml-auto">
            <div className="mb-2.5 rounded-2xl rounded-br-none bg-primary px-5 py-3 ">
              <p className="text-white ">
                Hello, I will check the schedule and inform you
              </p>
            </div>
            <p className="text-xs">1:57PM</p>
          </div>

          <MsgSeparator />

          <DocumentMessage
            author="Kirti Bansal"
            incoming
            read_receipt="read"
            timestamp="4:23pm"
          />

          <VoiceMessage
            incoming={false}
            read_receipt="delivered"
            timestamp="4:27pm"
          />

          <VoiceMessage
            author="Kirti Bansal"
            incoming={true}
            read_receipt="delivered"
            timestamp="4:27pm"
          />

          <MediaMessage
            assets={[]}
            author="Kirti Bansal"
            caption="Look, found some cuties online"
            incoming
            timestamp="5:32PM"
            read_receipt="read"
          />

          <div className="max-w-125">
            <p className="mb-2.5 text-sm font-medium">Andri Thomas</p>
            <div className="mb-2.5 rounded-2xl rounded-tl-none bg-gray px-5 py-3 dark:bg-boxdark-2">
              <p>
                I want to make an appointment tommorow from 2:00 PM to 5:00 ?
              </p>
            </div>
            <p className="text-xs">1:55PM</p>
          </div>

          <div className="max-w-125 ml-auto">
            <div className="mb-2.5 rounded-2xl rounded-br-none bg-primary px-5 py-3 ">
              <p className="text-white ">
                Hello, I will check the schedule and inform you
              </p>
            </div>
            <p className="text-xs">1:57PM</p>
          </div>
          <div className="max-w-125">
            <p className="mb-2.5 text-sm font-medium">Andri Thomas</p>
            <div className="mb-2.5 rounded-2xl rounded-tl-none bg-gray px-5 py-3 dark:bg-boxdark-2">
              <p>
                I want to make an appointment tommorow from 2:00 PM to 5:00 ?
              </p>
            </div>
            <p className="text-xs">1:55PM</p>
          </div>

          <div className="max-w-125 ml-auto">
            <div className="mb-2.5 rounded-2xl rounded-br-none bg-primary px-5 py-3 ">
              <p className="text-white ">
                Hello, I will check the schedule and inform you
              </p>
            </div>
            <p className="text-xs">1:57PM</p>
          </div>
          <div className="max-w-125">
            <p className="mb-2.5 text-sm font-medium">Andri Thomas</p>
            <div className="mb-2.5 rounded-2xl rounded-tl-none bg-gray px-5 py-3 dark:bg-boxdark-2">
              <p>
                I want to make an appointment tommorow from 2:00 PM to 5:00 ?
              </p>
            </div>
            <p className="text-xs">1:55PM</p>
          </div>

          <div className="max-w-125 ml-auto">
            <div className="mb-2.5 rounded-2xl rounded-br-none bg-primary px-5 py-3 ">
              <p className="text-white ">
                Hello, I will check the schedule and inform you
              </p>
            </div>
            <p className="text-xs">1:57PM</p>
          </div>
          <div className="max-w-125">
            <p className="mb-2.5 text-sm font-medium">Andri Thomas</p>
            <div className="mb-2.5 rounded-2xl rounded-tl-none bg-gray px-5 py-3 dark:bg-boxdark-2">
              <p>
                I want to make an appointment tommorow from 2:00 PM to 5:00 ?
              </p>
            </div>
            <p className="text-xs">1:55PM</p>
          </div>

          <div className="max-w-125 ml-auto">
            <div className="mb-2.5 rounded-2xl rounded-br-none bg-primary px-5 py-3 ">
              <p className="text-white ">
                Hello, I will check the schedule and inform you
              </p>
            </div>
            <p className="text-xs">1:57PM</p>
          </div>

          <TypingIndicator />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 border-t border-stroke px-6 py-5 bg-white dark:bg-boxdark  dark:border-strokedark">
          <form className="flex items-center justify-between space-x-4.5 ">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Type something here..."
                className="h-13 w-full rounded-md border border-stroke bg-gray pl-5 pr-19 text-black placeholder-body outline-none focus:border-slate-500 dark:border-strokedark dark:bg-boxdark-2 dark:text-white"
              />

              <div className="absolute right-5 top-1/2 -translate-y-1/2 items-center justify-end space-x-4">
                <button onClick={handleMicClick} className="hover:text-primary">
                  <Microphone size={20} />
                </button>
                <button
                  // onClick={(e) => {
                  //   e.preventDefault();
                  // }}
                  className="hover:text-primary"
                >
                  <Attachment />
                </button>
                <button
                  onClick={handleToggleGif}
                  className="hover:text-primary"
                >
                  <Gif size={20} />
                </button>
                <button className="hover:text-primary">
                  <EmojiPicker />
                </button>
              </div>
            </div>

            <button
              className="flex items-center justify-center h-13 max-w-13 w-full rounded-md bg-primary text-white
                    hover:bg-opacity-90 "
            >
              <PaperPlaneTilt size={24} weight="bold" />
            </button>
          </form>

          {gifOpen && <Giphy />}
        </div>
      </div>

      {videoCall && <VideoRoom open={videoCall} handleClose={handleToggleVideo}/>}

      {userInfoOpen && (
        <div className="w-1/4">
          <UserInfo handleToggleUserInfo={handleToggleUserInfo} />
        </div>
      )}
    </>
  );
};

export default Inbox;
