import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate1 = useNavigate()

  return (
    <div className="w-full h-screen bg-green-100 flex flex-col items-center justify-center text-center px-4">
      <div className='p-20'>
        <p className="text-main">Spend Smarter</p>
        <p className="text-main">Save More</p>
      </div>

      <div className='text-[1.4rem] w-[358px] h-[67px]'>
        <button
          className='bg-greenCustom w-full h-full rounded-full text-customLightText shadow-xl'
          onClick={() => navigate1("/register")}
        >
          Get Started
        </button>
      </div>

      <div className='mt-5 flex items-center justify-center gap-2'>
        <p className='text-gray-800'>Already have an account?</p>
        <p className='text-blue-500 cursor-pointer' onClick={() => navigate1('/login')}>Log In</p>
      </div>
    </div>
  )
}

export default Home
