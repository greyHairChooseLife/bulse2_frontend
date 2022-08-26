import React, { useState, useEffect } from 'react';
import './Parts.css';
import axios from 'axios';

const api = axios.create({
	baseURL: `http://${process.env.REACT_APP_API_SERVER_HOST}:${process.env.REACT_APP_API_SERVER_PORT}`,
})

const today = new Date();

interface IcalendarPrpps {
	setTheDay: any
}

export const Calendar = (props: IcalendarPrpps) => {

	const today = new Date();

	const calendarHead = 
		<div>
			<div className="MonthName">{today.getMonth()+1}</div>
			<div className="DayName"><span>Mon</span><span>Tue</span><span>Wen</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
		</div>

	let days = [];

	const firstOf = new Date(today.getFullYear(), today.getMonth(), 1);
	const lastDate = new Date(today.getFullYear(), today.getMonth()+1, 0); 		//이달의 마지막 날
	const skippingCount = firstOf.getDay();		//건너뛰어야 할 날(요일) 개수

	for(var j=0; j<skippingCount; j++){
		days.push(<div key={"SkippingDays"+j} className="SkippingDays"></div>)
	}

	for(var i=0; i<lastDate.getDate(); i++) days.push(i+1);

	days = days.map((ele, i) => {
		return <div key={"EachDay"+i} className="EachDay" onClick={() => {props.setTheDay(`${today.getFullYear()}-${today.getMonth()+1}-${i}`)}}>{ele}</div>;
	})
//  for문 대신 map 매소드를 이용하면 각 반복마다의 고유한 index값을 사용하기 쉽다.
//	for(var i=0; i<lastDate.getDate(); i++){
//		days.push(<div className="EachDay" onClick={() => {}}>{i+1}</div>);
//	}

	return (
		<div className="CalendarBox">
			{calendarHead}
			<div className="CalendarDays">
				{days}
			</div>
		</div>
	);
}


interface IscheduleProps {
	theDay: string
	setSession: any
}

export const Schedule = (props: IscheduleProps) => {
	const defaultValue = {
		theDay: props.theDay,
	}

	const [ theDay, setTheDay ] = useState(defaultValue.theDay);
	useEffect(() => {setTheDay(props.theDay)}, [props.theDay]);

	//	pending : waiting for approve
	//	recruiting : recruiting for reservation
	//	confirmed : schedule confirmed
	type scheduleStatus = 'pending' | 'recruiting' | 'confirmed';
	const scheduleStatus = ['pending', 'recruiting', 'confirmed'];
	const [ schedule1Status, setSchedule1Status ] = useState<scheduleStatus | null>(null);
	const [ schedule2Status, setSchedule2Status ] = useState<scheduleStatus | null>(null);
	const [ schedule3Status, setSchedule3Status ] = useState<scheduleStatus | null>(null);

	const [ schedule1Component, setSchedule1Component ] = useState<null | JSX.Element>(null);
	const [ schedule2Component, setSchedule2Component ] = useState<null | JSX.Element>(null);
	const [ schedule3Component, setSchedule3Component ] = useState<null | JSX.Element>(null);

	//	사용자가 선택한 날짜에 따라 그날 스케쥴을 받아오고, 적절한 하위 컴포넌트로 상태를 업데이트 한다.
	useEffect(() => {
		const setters = [setSchedule1Status, setSchedule2Status, setSchedule3Status];
		setters.forEach((ele: any) => ele(null));
		const getTodayReservation = async () => {
			const result = await api.get(`/project?theDay=${theDay}`);
			result.data.forEach((ele: any) => setters[ele.session-1](ele.status));
		}
		getTodayReservation();
	}, [theDay])

	const makeNewProjectComponent = (sessionNumber: number) => { return <button onClick={() => props.setSession(sessionNumber)}>새로운 제안하기</button>; }
	const makePendingComponent = () => { return <div onClick={() => {}}>관리자 승인을 기다리는 중입니다.</div> }
	const makeRecruitingComponent = () => { return <div onClick={() => {}}>참석자 모집 중입니다.</div> }
	const makeConfirmedComponent = () => { return <div onClick={() => {}}>확정된 일정입니다.</div> }

	//	선택 된 날짜의 3개 스케쥴(세션) 상태에 따라 걸맞는 컴포넌트를 생성 해 준다.
	useEffect(() => {
		const statuses = [schedule1Status, schedule2Status, schedule3Status];
		const setters = [setSchedule1Component, setSchedule2Component, setSchedule3Component];
		setters.forEach((ele: any, idx: number) => ele(makeNewProjectComponent(idx+1)));
		statuses.forEach((ele: any, idx: number) => {
			switch(ele){
				case 'pending':
					setters[idx](makePendingComponent());
					break;
				case 'recruiting':
					setters[idx](makeRecruitingComponent());
					break;
				case 'confirmed':
					setters[idx](makeConfirmedComponent());
					break;
			}
		})
	}, [schedule1Status, schedule2Status, schedule3Status]);

	return (
		<div className="ScheduleBox">
			<div>{schedule1Component}<p>13:00 ~ 15:00</p></div>
			<div>{schedule2Component}<p>16:00 ~ 18:00</p></div>
			<div>{schedule3Component}<p>19:00 ~ 21:00</p></div>
		</div>
	);
}



interface IidentityProps {
	setIdentity: any
}
export const Identity = (props: IidentityProps) => {

	const defaultValue = {
		name: '',
		mobileNumber: '',
	}

	const [ name, setName ] = useState(defaultValue.name);
	const [ mobileNumber, setMobileNumber ] = useState(defaultValue.mobileNumber);

	const onChangeInput = (e: any) => {
		switch(e.target.name){
			case 'name':
				setName(e.target.value);
				break;
			case 'mobileNumber':
				setMobileNumber(e.target.value);
				break;
		}
	}

	return (
		<div className="IdentityBox">
			<form onSubmit={(e: any) => {
				e.preventDefault();
				props.setIdentity({name: name, mobileNumber: mobileNumber});
				}}>
				<label>name</label>
				<input name="name" onChange={onChangeInput}></input>
				<label>mobile number</label>
				<input name="mobileNumber" onChange={onChangeInput}></input>
				<input type="submit"></input>
			</form>
		</div>
	)
}


interface IproposeProps {
	theDay: string
	session: number | undefined
	identity: {name: string, mobileNumber: string} | undefined
}
export const Propose = (props: IproposeProps) => {

	const defaultValue = {
		theDay: props.theDay,
		subject: '',
		content: '',
	}

	const [ theDay, setTheDay ] = useState(defaultValue.theDay);
	useEffect(() => {setTheDay(props.theDay)}, [props.theDay]);

	const [ subject, setSubject ] = useState(defaultValue.subject);
	const [ content, setContent ] = useState(defaultValue.content);

	const onChangeInput = (e: any) => {
		switch(e.target.name){
			case 'subject':
				setSubject(e.target.value);
				break;
			case 'content':
				setContent(e.target.value);
				break;
		}
	}

	//	identity, theDay, subject, content를 axios통신해서 서버에 저장한다.
	const onSubmitForm = () => {
		const proposed = {
			identity: props.identity,
			subject: subject,
			content: content,
			theDay: theDay,
			session: props.session
		}
		api.post(`/project`, proposed);
	}

	return (
		<div className="ProposeBox">
			<form onSubmit={(e: any) => {
				e.preventDefault();
				onSubmitForm();
				}}>
				<label>제목</label>
				<input name="subject" onChange={onChangeInput}></input>
				<label>내용</label>
				<textarea name="content" onChange={onChangeInput}></textarea>
				<input type='submit' value="등록하기"></input>
			</form>
		</div>
	)
}
