import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore"
import SidebarSkeleton from "./skeleton/SidebarSkeleton";
import { Users, Plus, UserRoundPlus, X } from "lucide-react"
import { useAuthStore } from "../store/useAuthStore";



const Sidebar = () => {
    const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading} = useChatStore()

    const { onlineUsers, authUser, addFriend } = useAuthStore();
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    const [friendFinder, setFriendFinder] = useState(false);
    const [friendEmail, setFriendEmail] = useState("");
    const [sidebarWidth, setSidebarWidth] = useState("w-17");
    const [sidebarHidden, setSidebarHidden] = useState("hidden");

    function handleClick() {
      setFriendFinder(!friendFinder)
      setSidebarWidth(friendFinder ? "w-17" : "w-full");
      setSidebarHidden(friendFinder ? "hidden" : "");
    }
    const handleAddFriend = async (e) => {
        e.preventDefault();
        if (!friendEmail.trim()) return;
        try {
            await addFriend({
                friendEmail: friendEmail,
            });

            setFriendEmail("");

        } catch (error) {
            console.log("Failed to send friendEmail:", error)
        }
    }

    useEffect(()=>{
        getUsers();
    },[getUsers])

    const filteredUsers = users.filter((user)=> user._id !== authUser._id && authUser.friends?.includes(user._id))
    const onlineFilteredUsers  = showOnlineOnly
       ? filteredUsers.filter((user) => onlineUsers.includes(user._id))
       : filteredUsers.filter((user)=> user._id.toString() !== authUser._id.toString());
    const onlineUsersCount = filteredUsers.filter((user) => onlineUsers.includes(user._id)).length

    if(isUsersLoading) return <SidebarSkeleton></SidebarSkeleton>
    return (
    <aside className={`h-full ${sidebarWidth} lg:w-72 border-r border-base-300 flex flex-col transition-all duration-300 ease-in-out sidebar-content`}>
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className={`font-medium ${sidebarHidden} lg:block`}>Contacts</span>
          {/* ADD FRIENDS */}
          <button 
            className="ml-auto hover:text-primary transition-colors" 
            onClick={handleClick}
            aria-label="Add friend"
          >
            {friendFinder ? <X className="size-6" /> : <Plus className="size-6" />}
          </button>
        </div>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${friendFinder ? 'max-h-20 mt-3' : 'max-h-0'}`}>
          <form onSubmit={handleAddFriend} className="flex items-center gap-2">
            <input 
              className="flex-1 input input-bordered input-sm bg-base-200" 
              placeholder="Enter email address" 
              type="email"
              value={friendEmail} 
              onChange={(e) => setFriendEmail(e.target.value)}
              autoFocus
            />
            <button 
              type="submit" 
              className="btn btn-primary btn-sm"
              disabled={!friendEmail.trim()}
            >
              <UserRoundPlus size={16} />
            </button>
          </form>
        </div>
        <div className={`mt-3 ${sidebarHidden} lg:flex items-center gap-2`}>
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsersCount} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {onlineFilteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-0 lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className={`${sidebarHidden} lg:block text-left min-w-0`}>
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {users.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
    )
}
export default Sidebar