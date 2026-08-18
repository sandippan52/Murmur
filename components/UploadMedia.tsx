
type UploadMediaProps ={

accept : string
onFileSelect : (file : File |null) => void

}

export default function UploadMedia({accept, onFileSelect}:UploadMediaProps){


return(
    <input
    type="file"
    accept={accept}
    onChange={(e)=>{
        const selectedFile = e.target.files?.[0]|| null;
        onFileSelect(selectedFile)
    }
    }
    />
)

}
