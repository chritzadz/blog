import { Notebook } from "lucide-react";

export default function NotepadUI() {
    return (
        <div className="w-full max-w-4xl bg-white shadow-md border-t-gray-700 border-l-gray-700 border-r-gray-700 rounded-md overflow-hidden">
            {/* Upper tab*/}
            <div className="flex items-center bg-[#57564F] pt-3">
                <div className="bg-white">
                    <div className="rounded-br-md h-7 px-3 py-1 bg-[#57564F] flex items-center">
                        <Notebook size={14}></Notebook>
                    </div>
                </div>
                <div className="bg-white rounded-t-md px-2 h-7 w-50 border-t-gray-700 items-center flex">
                    <p className="text-xs font-bold text-black">Introduction.txt</p>
                </div>
                <div className="bg-white">
                    <div className="rounded-bl-md px-3 py-1 bg-[#57564F]">
                        <p className="text-sm">+</p>
                    </div>
                </div>
            </div>

            {/* Menu bar */}
            <div>
                <div className="flex gap-6 px-3 py-1 border-gray-100 text-sm text-gray-700">
                    <div className="flex items-center gap-3">
                        <span className="font-medium">File</span>
                        <span className="font-medium">Edit</span>
                        <span className="font-medium">View</span>
                    </div>
                </div>

                {/* Editor area - non-functional visual only */}
                <div className="bg-white border border-gray-200">
                    <div
                        className="w-full h-40 p-2 text-sm bg-white font-serif text-gray-900 flex"
                        style={{ fontFamily: '"Consolas", Times, serif' }}
                    >
                        {`
                            hello i am chris! welcome to my personal blog. the purpose of this web/blog/portfolio is to document all my learnings
                            as a computer science student. no specific domain knowledge here, but in contrast, i will try to cover as many cs related
                            topics i can (if i found it interesting enough or courses i took in school). hence, i named the web as my personal blog, rather than
                            portfolio. i will make my explanation as simple as possible and will definitely do a lot of analogy that i think works in understanding the filfthy
                            concept in cs. enjoy the blog!
                        `
                        }
                    </div>
                    <div
                        className="w-full h-20 p-2 text-sm bg-white font-serif text-gray-900 flex"
                        style={{ fontFamily: '"Consolas", Times, serif' }}
                    >
                        {`
                            P.S. there is a sneaky projects tab which you can see which is for my portfolio. hey! i need it for my graduate jobs :)
                        `
                        }
                    </div>
                    <div
                        className="w-full h-20 p-2 text-sm bg-white font-serif text-gray-900 flex"
                        style={{ fontFamily: '"Consolas", Times, serif' }}
                    >
                        {`
                            and yeah do not talk about the ui in this web, i am trying to make a blog not a museum :)
                        `
                        }
                    </div>
                    <div
                        className="w-full h-20 p-2 text-sm bg-white font-serif text-gray-900 flex"
                        style={{ fontFamily: '"Consolas", Times, serif' }}
                    >
                        {`
                            oh yeah, i like to list out everything using notepad. feels more personal.
                        `
                        }
                    </div>
                </div>

                {/* Status bar */}
                <div className="bg-gray-50 px-3 py-2 border-t border-gray-100 text-xs text-gray-600 flex justify-between">
                    <div>Ln 1, Col 1</div>
                    <div>Windows (CRLF) UTF-8</div>
                </div>
            </div>
        </div>
    );
}
