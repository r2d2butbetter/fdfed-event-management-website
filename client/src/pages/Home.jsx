import React from 'react';
import Navbar from '../components/navbar';
import ButtonUsage from '../components/button';

function Home() {
    return (
        <div>
            <Navbar />
            <h1>Home</h1>
            <p>Welcome to the Home page!</p>
            <ButtonUsage />
        </div>
    );
}

export default Home;