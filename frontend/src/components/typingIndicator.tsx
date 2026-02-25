const TypingIndicator = () => {
  return (
    <div className="flex gap-1 items-center">
      <span className="text-xs font-bold text-blue-400 dark:text-blue-400">
        typing
      </span>
      <div className="w-1 h-1 bg-blue-300 dark:bg-blue-500 animate-bounce rounded-full"></div>
      <div className="w-1 h-1 bg-blue-300 dark:bg-blue-500 animate-bounce delay-300 rounded-full"></div>
      <div className="w-1 h-1 bg-blue-300 dark:bg-blue-500 animate-bounce delay-500 rounded-full"></div>
    </div>
  );
};
export default TypingIndicator;
