import React from 'react';
import { Link } from 'react-router-dom';
import travolta from './travolta_lost.gif'
import './NotFoundPage.css';
import styled from 'styled-components';

const HoverText = styled.button`
	background: #2979FF;
	:hover {
		background: #005eff;
		cursor: pointer;
	}
`




class NotFoundPage extends React.Component{

    render(){
        return <div className = "parent">
            <p className = "notFoundTitle"> 404 :( </p>
            <img className = "travolta" src={travolta}  />
            <p className = "info"> That page couldn't be found... </p>

            <p style={{textAlign:"center"}}>
                <Link to={'/'}>
                    <HoverText className={'backButton mt-20'} type="submit">Take me back</HoverText>
                </Link>
            </p>
        </div>;
    }
}

export default NotFoundPage;