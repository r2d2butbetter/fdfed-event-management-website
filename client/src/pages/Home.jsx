import React from 'react';
import Navbar from '../components/navbar';
import ButtonUsage from '../components/button';
import DarkModeToggle from '../components/darkmodetoggle'

function Home() {
    return (
        <div>
            <Navbar />
            <h1>Home</h1>
            <p>Welcome to the Home page!</p>
            <ButtonUsage />

            <DarkModeToggle />
        </div>
    );
}

export default Home;