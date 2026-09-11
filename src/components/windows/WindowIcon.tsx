import React from "react";

interface WindowIconProps {
  Icon: React.ElementType;
	openState?: boolean;
	setOpenState?: (state: boolean) => void;
	activeState?: boolean;
  onClick?: () => void;
}

const WindowIcon: React.FC<WindowIconProps> = ({ Icon, onClick, openState, activeState }) => {
  return (
		<div className="">
			<div
				className="relative flex items-center justify-center cursor-pointer m-1 p-2.5 rounded-md hover:bg-gray-700 h-12 w-12"
				onClick={onClick}
			>
				<Icon className="h-15 w-15 text-white" />
				{openState && (
					<div
						className={`absolute bottom-0.5 bg-gray-400 h-0.75 rounded-full transition-all duration-300 ${
							activeState ? "w-3" : "w-1.5"
						}`}
					></div>
				)}
			</div>
		</div>
    
  );
};

export default WindowIcon;