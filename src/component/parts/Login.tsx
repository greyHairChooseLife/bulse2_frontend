import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import './_.css';
import { useCookies } from 'react-cookie';
import axios from 'axios';

const api = axios.create({
	baseURL: `http://${process.env.REACT_APP_API_SERVER_HOST}:${process.env.REACT_APP_API_SERVER_PORT}`,
});

type identityType = {
	name: string,
	mobileNumber: string
}
type reservationDataType = {RId: number, Rdevice: string, Rpayment: number, PId: number, Psubject: string, Pname: string, Pdate: Date, Psession: number}[];
interface Ilogin {
	identity: identityType | undefined
	setIdentity: any
	setReservationRecord: Dispatch<SetStateAction<reservationDataType>>
	theDay: any
	setMode: any
	mode: any
	setUserSelectedReservation: any
	setUserSelectedProposal: any
	setRUS: any
}
export const Login = (props: Ilogin) => {
	const [ cookies, setCookie, removeCookie ] = useCookies(['loginInfoByBulse']);

	//	로그인 여부 확인용 쿠키 체크해서 만약 있다면 로그인으로 여겨 준다.
	useEffect(() => { cookies.loginInfoByBulse !== undefined && props.setIdentity(cookies.loginInfoByBulse) }, [])

	//	로그인 한(하는) 경우, 그 달의 예약 정보를 업데이트 해 준다.
	useEffect(() => {
		if(props.identity !== undefined){
			const getReservationRecord = async () => {
				const result = await api.get('/reservation', {params: {theDay: props.theDay, name: props.identity?.name, mobileNumber: props.identity?.mobileNumber}});

				props.setReservationRecord(
					//	타임존 반영해서 형식 변경
					result.data.map((ele: any) => {
						const origin = new Date(ele.Pdate);
						ele.Pdate = origin.getMonth()+1 <= 9 ? `${origin.getFullYear()}-${'0'+(origin.getMonth()+1)}-${origin.getDate()}`
						: `${origin.getFullYear()}-${origin.getMonth()+1}-${origin.getDate()}`;
						return ele;
					})
				)
			}
			getReservationRecord();
		}
	}, [props.identity])

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
		setCookie('loginInfoByBulse', {name: name, mobileNumber: mobileNumber}, {maxAge: 60*60*24*1});	//	24h 유효한 로그인 쿠키
		props.setIdentity({name: name, mobileNumber: mobileNumber});
	}

	const handleOnClickLogoutBtn = () => {
		if(window.confirm('로그아웃 하시겠습니까?')){
			removeCookie('loginInfoByBulse');
			props.setIdentity(undefined);
			props.setMode(0);
			props.setUserSelectedProposal(null);
			props.setUserSelectedReservation(null);
			props.setRUS(false);
		}
	}

	let element = null;
	if(props.identity === undefined){
		element = 
			<div className="Login">
				<p>본인 확인</p>
				<input name="name" placeholder='이름' onChange={handleOnChangeInput}></input>
				<input name="mobileNumber" placeholder='전화번호' onChange={handleOnChangeInput}></input>
				<button onClick={handleOnClickLoginBtn}>확인</button>
				<div>
					<p>* 회원 가입이 필요하지 않습니다.</p>
					<p>* 입력된 전화번호로 예약 관련 안내가 전달됩니다.</p>
					<p>* 24시간 동안 유지됩니다.</p>
				</div>
			</div>
	}else{
		element = 
			<div className="Logout">
				<p>안녕하세요, {props.identity.name}님</p>
				<button onClick={handleOnClickLogoutBtn}>로그아웃</button>
				<button onClick={() => {
					props.mode === 1 ? props.setMode(0) : props.setMode(1);
					props.setUserSelectedProposal(null);
					props.setUserSelectedReservation(null);
					props.setRUS(false);
				}}>내 정보<br />{props.mode === 1 ? '닫기' : '열기'}</button>
			</div>
	}

	return (
		<>
			{element}
		</>
	);
}
