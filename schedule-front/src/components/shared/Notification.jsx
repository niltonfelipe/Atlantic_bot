const Notification = ({ message, type, onClose }) => {
  if (!message) return null;
  return (
    <div
      className={`fixed bottom-2 right-4 p-4 rounded-md shadow-lg text-white ${
        type === "success" ? "bg-green-700" : "bg-red-500"
      }`}
      style={{ zIndex: 1000 }}
    >
      {message}
      <button onClick={onClose} className="ml-4 font-bold">
        X
      </button>
    </div>
  );
};

export default Notification;