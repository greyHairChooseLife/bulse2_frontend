import React, { useState, useEffect } from 'react';
import './_.css';
import axios from 'axios';

const api = axios.create({
	baseURL: `http://${process.env.REACT_APP_API_SERVER_HOST}:${process.env.REACT_APP_API_SERVER_PORT}`,
})

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

	const makeCreatingComponent = (sessionNumber: number) => {
		return <button onClick={() => events.newProject.onClick(sessionNumber)
	}>새로운 제안하기</button>; }

	const makePendingComponent = (sessionNumber: number, previousState: any) => {
		return <div onClick={() => events.pending.onClick(sessionNumber, previousState)} onMouseEnter={() => events.pending.onMouseEnter(sessionNumber, previousState)} onMouseLeave={() => events.pending.onMouseLeave(previousState)
	}>관리자 승인을 기다리는 중입니다.</div> }

	const makeRecruitingComponent = (sessionNumber: number, previousState: any) => {
		return <div onClick={() => events.recruiting.onClick(sessionNumber, previousState)} onMouseEnter={() => events.recruiting.onMouseEnter(sessionNumber, previousState)} onMouseLeave={events.recruiting.onMouseLeave
	}>참석자 모집 중입니다.</div> }

	const makeConfirmedComponent = (sessionNumber: number, previousState: any) => {
		return <div onClick={() => events.confirmed.onClick(sessionNumber, previousState)} onMouseEnter={() => events.confirmed.onMouseEnter(sessionNumber, previousState)} onMouseLeave={events.confirmed.onMouseLeave
	}>확정된 일정입니다.</div> }

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
