import TeacherPage from "./_components/teacher-page";
import { Suspense } from "react";
import Loading from "./loading";

const Page = () => {
    return (
        <div className="size-full">
            <Suspense fallback={<Loading/>}>
                <TeacherPage />
            </Suspense>
        </div>
    );
};

export default Page;