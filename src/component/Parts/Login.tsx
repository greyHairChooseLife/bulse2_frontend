import React, { useState, useEffect } from 'react';
import './_.css';
import { useCookies } from 'react-cookie';

type identityType = {
	name: string,
	mobileNumber: string
}
interface Ilogin {
	identity: identityType | undefined
	setIdentity: any
}
export const Login = (props: Ilogin) => {
	const [ cookies, setCookie, removeCookie ] = useCookies(['loginInfoByBulse']);

	//	로그인 여부 확인용 쿠키 체크해서 만약 있다면 로그인으로 여겨 준다.
	useEffect(() => { cookies.loginInfoByBulse !== undefined && props.setIdentity(cookies.loginInfoByBulse) }, [])

	const [ name, setName ] = useState<string>('');
	const [ mobileNumber, setMobileNumber ] = useState<string>('');

	const handleOnChangeInput = (e: any) => {
		switch(e.target.name){
			case 'name':
				setName(e.target.value);
				break;
			case 'mobileNumber':
				setMobileNumber(e.target.value);
				break;
		}
	}

	const handleOnClickLoginBtn = () => {
		setCookie('loginInfoByBulse', {name: name, mobileNumber: mobileNumber}, {maxAge: 60*60*24*7});	//	7일간 유효한 로그인 쿠키
		props.setIdentity({name: name, mobileNumber: mobileNumber});
	}

	const handleOnClickLogoutBtn = () => {
		removeCookie('loginInfoByBulse');
		props.setIdentity(undefined);
	}

	let element = null;
	if(props.identity === undefined){
		element = 
			<div>
				<input name="name" placeholder='이름' onChange={handleOnChangeInput}></input>
				<input name="mobileNumber" placeholder='전화번호' onChange={handleOnChangeInput}></input>
				<button onClick={handleOnClickLoginBtn}>로그인</button>
			</div>
	}else{
		element = 
			<div>
				<p>안녕하세요, {props.identity.name}님</p>
				<button onClick={handleOnClickLogoutBtn}>로그아웃</button>
				<span>귀icon</span>
				<span>입icon</span>
			</div>
	}

	return (
		<div className="">
			{element}
		</div>
	);
}
