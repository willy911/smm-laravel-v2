import { forwardRef, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { cn, config } from '@/lib/utils';
import { ReactSummernoteLite } from '@easylogic/react-summernote-lite';

export default forwardRef(function TextEditor({ isFocused = false, className, ...props }, ref) {
    const editorRef = useRef(null);

    // return (
    //     <ReactSummernoteLite
    //         {...props}
    //         className={cn(
    //             className
    //           )}
    //           onInit={({ note }) => {
    //             note.summernote('pasteHTML', props.value);
    //           }}
    //     />
    //   );

    return (
        <Editor
            {...props}
            className={cn(
                "z-[1000]",
                "aria-invalid:ring-destructive/50 aria-invalid:border-destructive aria-invalid:text-destructive aria-invalid:placeholder:text-destructive aria-invalid:border-2 dark:aria-invalid:ring-destructive/50",
                " aria-invalid:file:bg-destructive/10 hover:aria-invalid:file:bg-destructive/20 aria-invalid:file:text-destructive",
                className
              )}
            apiKey={config('third_party_plugin').tinymce.api_key}
            onInit={(evt, editor) => (editorRef.current = editor)}
            init={{
                height: 300,
                menubar: true,
                readonly: false,
                plugins: [
                    // 'a11ychecker',
                    'advlist',
                    // 'advcode',
                    // 'advtable',
                    'autolink',
                    // 'checklist',
                    // 'export',
                    'lists',
                    'link',
                    'image',
                    'charmap',
                    'preview',
                    'anchor',
                    'searchreplace',
                    'visualblocks',
                    // 'powerpaste',
                    'fullscreen',
                    // 'formatpainter',
                    'insertdatetime',
                    'media',
                    'table',
                    'help',
                    'wordcount',
                    'code',
                ],
                toolbar:
                    'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | l      ink image | print preview media fullpage | forecolor backcolor emoticons',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
            }}
        />
    );
});
