export const CheckIcon: React.FC<{
    className?: string
}> = ({ className }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={className}>
            <circle fill="#104641" cx="8" cy="8" r="8"></circle>
            <path
                fill="#26a69a"
                d="M8 15A7 7 0 118 1 7 7 0 018 15ZM8 16A8 8 0 108 0 8 8 0 008 16ZM10.604 6.146A.5.5 0 0110.604 6.854L7.604 9.854A.5.5 0 016.896 9.854L5.396 8.354A.5.5 0 116.104 7.646L7.25 8.793 9.896 6.146A.5.5 0 0110.604 6.146Z"
            ></path>
        </svg>
    )
}
