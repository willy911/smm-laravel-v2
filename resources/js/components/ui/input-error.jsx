import ParseToHTML from 'html-react-parser';

export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p {...props} className={'text-xs text-red-600 -mt-1 ' + className}>
            {ParseToHTML(message)}
        </p>
    ) : null;
}
