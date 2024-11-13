import { LucideProps } from "lucide-react";
import { FC } from "react";

export const VerificationBadgeIcon: FC<LucideProps> = (props) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
    >
      <path
        d="M17.7508 9.41667C17.7508 8.1 17.0217 6.95833 15.9608 6.41667C16.0892 6.05417 16.1592 5.6625 16.1592 5.25C16.1592 3.40833 14.7342 1.91833 12.9775 1.91833C12.5858 1.91833 12.2108 1.98833 11.8642 2.12667C11.3492 1.0125 10.2592 0.25 9.00083 0.25C7.7425 0.25 6.65417 1.01417 6.13667 2.125C5.79083 1.9875 5.415 1.91667 5.02333 1.91667C3.265 1.91667 1.84167 3.40833 1.84167 5.25C1.84167 5.66167 1.91083 6.05333 2.03917 6.41667C0.979167 6.95833 0.25 8.09833 0.25 9.41667C0.25 10.6625 0.901667 11.7483 1.86833 12.3217C1.85167 12.4633 1.84167 12.605 1.84167 12.75C1.84167 14.5917 3.265 16.0833 5.02333 16.0833C5.415 16.0833 5.79 16.0117 6.13583 15.875C6.6525 16.9867 7.74083 17.75 9 17.75C10.26 17.75 11.3483 16.9867 11.8642 15.875C12.21 16.0108 12.585 16.0817 12.9775 16.0817C14.7358 16.0817 16.1592 14.59 16.1592 12.7483C16.1592 12.6033 16.1492 12.4617 16.1317 12.3208C17.0967 11.7483 17.7508 10.6625 17.7508 9.4175V9.41667ZM12.2375 6.63833L8.62583 12.055C8.505 12.2358 8.3075 12.3333 8.105 12.3333C7.98583 12.3333 7.865 12.3 7.75833 12.2283L7.6625 12.15L5.65 10.1375C5.40583 9.89333 5.40583 9.4975 5.65 9.25417C5.89417 9.01083 6.29 9.00917 6.53333 9.25417L8.00833 10.7267L11.1958 5.94333C11.3875 5.65583 11.7758 5.58 12.0625 5.77083C12.3508 5.9625 12.4292 6.35083 12.2375 6.6375V6.63833Z"
        fill="#1D9BF0"
      />
    </svg>
  );
};
