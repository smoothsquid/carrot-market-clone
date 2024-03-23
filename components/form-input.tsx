import { HTMLInputTypeAttribute } from "react";

// interface, type 어느정도는 취향 차이
// type의 기능이 필요하기 전 까지 interface를 사용
// type의 기능이란?
interface FormInputProps {
  type: HTMLInputTypeAttribute | undefined;
  placeholder: string;
  required: boolean;
  errors: string[];
}

const FormInput = ({ type, placeholder, required, errors }: FormInputProps) => {
  return (
    <div className="flex flex-col gap-2">
      <input
        className="h-10 w-full rounded-md border-none bg-transparent ring-2 ring-neutral-200 transition placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-orange-500"
        type={type}
        placeholder={placeholder}
        required={required}
      />
      {errors.map((error, index) => (
        <span key={index} className="text-sm text-red-500">
          {error}
        </span>
      ))}
    </div>
  );
};

export default FormInput;