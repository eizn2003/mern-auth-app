import { Header } from '../components/Header.jsx'
import { NavBar } from '../components/NavBar.jsx'

export const Home = () => {
	return (
		<div className='flex flex-col items-center justify-center min-h-screen bg-[url("/bg_img.png")] bg-cover bg-center'>
			<NavBar />
			<Header />
		</div>
	);
}