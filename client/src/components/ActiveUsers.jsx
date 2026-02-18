/**
 * Displays colored avatar circles for each user currently in the document.
 * Each user gets a deterministic color based on their user ID.
 */

// Deterministic color palette for user avatars
const AVATAR_COLORS = [
    "from-violet-500 to-purple-600",
    "from-cyan-500 to-blue-600",
    "from-emerald-500 to-green-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-teal-500 to-cyan-600",
    "from-fuchsia-500 to-purple-600",
    "from-sky-500 to-indigo-600",
];

function getColor(userId) {
    // Simple hash to pick a consistent color per user
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function ActiveUsers({ users = [] }) {
    if (users.length === 0) return null;

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
                Online
            </span>
            <div className="flex -space-x-2">
                {users.map((user, index) => (
                    <div
                        key={user._id || index}
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${getColor(
                            user._id || String(index)
                        )} flex items-center justify-center text-white text-xs font-bold ring-2 ring-surface cursor-default transition-transform hover:scale-110 hover:z-10`}
                        title={user.name || "User"}
                    >
                        {(user.name || "?").charAt(0).toUpperCase()}
                    </div>
                ))}
            </div>
            <span className="text-xs text-text-secondary ml-1">
                {users.length} {users.length === 1 ? "user" : "users"}
            </span>
        </div>
    );
}
