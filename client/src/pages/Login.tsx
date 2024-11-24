
import { googleAuth } from "../api";
import { useGoogleLogin } from "@react-oauth/google"
const Login = () => {

    const responseGoogle = async (response: any) => {
        try{
            if(response['code']){
                const res = await googleAuth(response['code'])
                console.log(res)
                const {email,name,picture} = res.data.user as {email:string,name:string,picture:string}
                console.log(email,name,picture)
            }
            // console.log(response)

          

        }catch(err){
            console.log("Error in login", err);
        }
    }
    const googleLogin = useGoogleLogin({
        onSuccess:responseGoogle,
        onError:responseGoogle,
        flow: "auth-code",
    })
  return (
    <div className='flex justify-center items-center h-screen bg-black'>
      {/* <h1 className='text-white text-8xl'>Page Not Found</h1>
       */}
       <div>
        <button onClick={googleLogin} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Login with Google</button>
       </div>
    </div>
  )
}

export default Login
