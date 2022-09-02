import React, { useState, useEffect } from 'react';
import './Parts.css';
import axios from 'axios';

const api = axios.create({
	baseURL: `http://${process.env.REACT_APP_API_SERVER_HOST}:${process.env.REACT_APP_API_SERVER_PORT}`,
})

const today = new Date();

type pageModeType = 'logo' | 'readProject' | 'createProject' | 'updateProject' | 'deleteProject'
interface IcalendarPrpps {
	setTheDay: any
	setSession: any
	setPageMode: any
	pageMode: pageModeType
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

	//	0부터 적용하면 맨 앞에 일요일을 넣겠다는 것이다. 나는 월요일부터 표시하니까 1로 시작
	for(var j=1; j<skippingCount; j++) days.push(<div key={"SkippingDays"+j} className="SkippingDays"></div>)

	for(var i=0; i<lastDate.getDate(); i++) days.push(i+1);

	const handleOnClick = (i: number) => {
		if(i-skippingCount+2 >= 1){
			if(props.pageMode !== 'createProject'){
				props.setTheDay(`${today.getFullYear()}-${today.getMonth()+1}-${i-skippingCount+2}`)
				//	날짜가 바뀌면 pageMode와 session정보를 기본값('logo', undefined)으로 초기화 해 준다.
				props.setSession(undefined);
				props.setPageMode('logo');
			}else{
				if(window.confirm('작성 중이던 내용이 사라집니다.')){
					props.setTheDay(`${today.getFullYear()}-${today.getMonth()+1}-${i-skippingCount+2}`)
					props.setSession(undefined);
					props.setPageMode('logo');
				}
			}
		}
	}

	days = days.map((ele, i) => {
		return <div key={"EachDay"+i} className="EachDay" onClick={() => handleOnClick(i)}>{ele}</div>;
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
	setPageMode: any
}

export const Schedule = (props: IscheduleProps) => {
	const defaultValue = {
		theDay: props.theDay,
	}

	const [ theDay, setTheDay ] = useState(defaultValue.theDay);
	useEffect(() => {
		setPreviousState(['logo', undefined]);
		setTheDay(props.theDay)
	}, [props.theDay]);

	//	pending : waiting for approve
	//	recruiting : recruiting for reservation
	//	confirmed : schedule confirmed
	type scheduleStatusType = 'pending' | 'recruiting' | 'confirmed';
	const scheduleStatus = ['pending', 'recruiting', 'confirmed'];
	const [ schedule1Status, setSchedule1Status ] = useState<scheduleStatusType | null>(null);
	const [ schedule2Status, setSchedule2Status ] = useState<scheduleStatusType | null>(null);
	const [ schedule3Status, setSchedule3Status ] = useState<scheduleStatusType | null>(null);

	const [ schedule1Component, setSchedule1Component ] = useState<null | JSX.Element>(null);
	const [ schedule2Component, setSchedule2Component ] = useState<null | JSX.Element>(null);
	const [ schedule3Component, setSchedule3Component ] = useState<null | JSX.Element>(null);

	//	사용자가 선택한 날짜에 따라 그날 스케쥴을 받아오고, 적절한 하위 컴포넌트로 상태를 업데이트 한다.
	useEffect(() => {
		const setters = [setSchedule1Status, setSchedule2Status, setSchedule3Status];
		setters.forEach((ele: any) => ele(null));
		const getProject = async () => {
			const result = await api.get(`/project?theDay=${theDay}`);
			result.data.forEach((ele: any) => setters[ele.session-1](ele.status));
		}
		getProject();
	}, [theDay])

	type pageModeType = 'logo' | 'readProject' | 'createProject' | 'updateProject' | 'deleteProject'
	type previousStateType = [pageModeType, number | undefined];
	const [ previousState, setPreviousState ] = useState<previousStateType>(['logo', undefined]);

	let events = {
		newProject: {
			onClick: (sessionNumber: number) => {
				if(previousState[0] !== 'readProject' && previousState[0] !== 'logo'){	//	logo 또는 readProject 모드라면 confirm() 필요 없으니 바로 else로 실행시킨다.
					if(sessionNumber !== previousState[1]){		//	세션이 바뀌지 않는 경우는 방금 활성화된 button을 눌렀다는 소리다. 그때는 이벤트가 일어나서는 안되지
						if(window.confirm('작성 중이던 내용이 사라집니다.')){
							props.setPageMode('createProject');
							props.setSession(sessionNumber);
							setPreviousState(['createProject', sessionNumber]);
						}
					}
				}else{
					props.setPageMode('createProject');
					props.setSession(sessionNumber);
					setPreviousState(['createProject', sessionNumber]);
				}
			}
		},
		pending: {
			onClick: (sessionNumber: number, previousState: any) => {
				if(previousState[0] !== 'readProject' && previousState[0] !== 'logo'){
					if(window.confirm('작성 중이던 내용이 사라집니다.')){
						setPreviousState(['readProject', sessionNumber]);
						props.setPageMode('readProject');
						props.setSession(sessionNumber);
					}
				}else{
					setPreviousState(['readProject', sessionNumber]);
				}
			},
			onMouseEnter: (sessionNumber: number, previousState: any) => {
				if(previousState[0] === 'logo' || previousState[0] === 'readProject'){
					props.setPageMode('readProject');
					props.setSession(sessionNumber);
				}
			},
			onMouseLeave: (previousState: any) => {
				if(previousState[0] === 'readProject' || previousState[0] === 'logo'){
					props.setPageMode(previousState[0]);
					props.setSession(previousState[1]);
				}
			},
		},
		recruiting: {
			onClick: (sessionNumber: number, previousState: any) => {
				if(previousState[0] !== 'readProject' && previousState[0] !== 'logo'){
					if(window.confirm('작성 중이던 내용이 사라집니다.')){
						setPreviousState(['readProject', sessionNumber]);
						props.setPageMode('readProject');
						props.setSession(sessionNumber);
					}
				}else{
					setPreviousState(['readProject', sessionNumber]);
				}
			},
			onMouseEnter: (sessionNumber: number, previousState: any) => {
				if(previousState[0] === 'logo' || previousState[0] === 'readProject'){
					props.setPageMode('readProject');
					props.setSession(sessionNumber);
				}
			},
			onMouseLeave: (previousState: any) => {
				if(previousState[0] === 'readProject' || previousState[0] === 'logo'){
					props.setPageMode(previousState[0]);
					props.setSession(previousState[1]);
				}
			},
		},
		confirmed: {
			onClick: (sessionNumber: number, previousState: any) => {
				if(previousState[0] !== 'readProject' && previousState[0] !== 'logo'){
					if(window.confirm('작성 중이던 내용이 사라집니다.')){
						setPreviousState(['readProject', sessionNumber]);
						props.setPageMode('readProject');
						props.setSession(sessionNumber);
					}
				}else{
					setPreviousState(['readProject', sessionNumber]);
				}
			},
			onMouseEnter: (sessionNumber: number, previousState: any) => {
				if(previousState[0] === 'logo' || previousState[0] === 'readProject'){
					props.setPageMode('readProject');
					props.setSession(sessionNumber);
				}
			},
			onMouseLeave: (previousState: any) => {
				if(previousState[0] === 'readProject' || previousState[0] === 'logo'){
					props.setPageMode(previousState[0]);
					props.setSession(previousState[1]);
				}
			},
		},
	};

	const makeCreatingComponent = (sessionNumber: number) => { return <button onClick={() => events.newProject.onClick(sessionNumber)}>새로운 제안하기</button>; }
	const makePendingComponent = (sessionNumber: number, previousState: any) => { return <div onClick={() => events.pending.onClick(sessionNumber, previousState)} onMouseEnter={() => events.pending.onMouseEnter(sessionNumber, previousState)} onMouseLeave={() => events.pending.onMouseLeave(previousState)}
	>관리자 승인을 기다리는 중입니다.</div> }
	const makeRecruitingComponent = (sessionNumber: number, previousState: any) => { return <div onClick={() => events.recruiting.onClick(sessionNumber, previousState)} onMouseEnter={() => events.recruiting.onMouseEnter(sessionNumber, previousState)} onMouseLeave={events.recruiting.onMouseLeave}
	>참석자 모집 중입니다.</div> }
	const makeConfirmedComponent = (sessionNumber: number, previousState: any) => { return <div onClick={() => events.confirmed.onClick(sessionNumber, previousState)} onMouseEnter={() => events.confirmed.onMouseEnter(sessionNumber, previousState)} onMouseLeave={events.confirmed.onMouseLeave}
	>확정된 일정입니다.</div> }

	//	선택 된 날짜의 3개 스케쥴(세션) 상태에 따라 걸맞는 컴포넌트를 생성 해 준다.
	useEffect(() => {
		const statuses = [schedule1Status, schedule2Status, schedule3Status];
		const setters = [setSchedule1Component, setSchedule2Component, setSchedule3Component];
		setters.forEach((ele: any, idx: number) => ele(makeCreatingComponent(idx+1)));
		statuses.forEach((ele: any, idx: number) => {
			switch(ele){
				case 'pending':
					setters[idx](makePendingComponent(idx+1, previousState));
					break;
				case 'recruiting':
					setters[idx](makeRecruitingComponent(idx+1, previousState));
					break;
				case 'confirmed':
					setters[idx](makeConfirmedComponent(idx+1, previousState));
					break;
			}
		})
	}, [schedule1Status, schedule2Status, schedule3Status, previousState]);

	return (
		<div className="ScheduleBox">
			<div>{schedule1Component}<p>13:00 ~ 15:00</p></div>
			<div>{schedule2Component}<p>16:00 ~ 18:00</p></div>
			<div>{schedule3Component}<p>19:00 ~ 21:00</p></div>
		</div>
	);
}


type sessionType = 1 | 2 | 3 | undefined;
interface IidentityProps {
	setIdentity: any
	session:sessionType 
}
export const Identity = (props: IidentityProps) => {

	const defaultValue = {
		name: '',
		mobileNumber: '',
	}

	const [ name, setName ] = useState(defaultValue.name);
	const [ mobileNumber, setMobileNumber ] = useState(defaultValue.mobileNumber);

	//	세션이 바뀌면 form을 빈칸으로 초기화한다.
	useEffect(() => {
		setName(defaultValue.name);
		setMobileNumber(defaultValue.mobileNumber);
	}, [props.session])

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
				<input name="name" onChange={onChangeInput} value={name}></input>
				<label>mobile number</label>
				<input name="mobileNumber" onChange={onChangeInput} value={mobileNumber}></input>
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


interface IreadProject {
	theDay: string
	session: number | undefined
}
export const ReadProject = (props: IreadProject) => {

	type loadProjectType = {
		subject: string,
		content: string
		name: string
		mobileNumber: string
	}
	const [ loadProject, setLoadProject ] = useState<null | loadProjectType>(null);

	useEffect(() => {
		const getProjectAndMatchSession = async () => {
			const result = await api.get(`/project?theDay=${props.theDay}`);
			const sessionMatched = result.data.find((ele: any) => ele.session === props.session);

			//	이름 가리기 : 세글자 이하인 경우
			//if(sessionMatched.name.length <=3) sessionMatched.name = sessionMatched.name.split('').filter((ele: any, idx: number) => idx !== 1).join('*');
			if(sessionMatched.name.length <=3) sessionMatched.name = [...sessionMatched.name.split('').slice(0, 1), '*', ...sessionMatched.name.split('').slice(2)].join('');
			//	이름 가리기 : 네글자 이상인 경우
			else sessionMatched.name = [...sessionMatched.name.split('').slice(0, 1), '**', ...sessionMatched.name.split('').slice(3)].join('');
			//	전화번호 끝자리만 표시
			sessionMatched.mobile_number = sessionMatched.mobile_number.split('').slice(-4).join('');

			setLoadProject({subject: sessionMatched.subject, content: sessionMatched.content, name: sessionMatched.name, mobileNumber: sessionMatched.mobile_number})
		}
		getProjectAndMatchSession();
	}, [props.theDay, props.session])

	return (
		<div>
			<div>
				{loadProject?.name}
				{loadProject?.mobileNumber}
			</div>
			<div>
				{loadProject?.subject}
			</div>
			<div>
				{loadProject?.content}
			</div>
		</div>
	)
}


