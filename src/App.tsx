import React, { useState, useEffect } from 'react';
import { Login } from './component/parts/Login';
import { Calendar } from './component/parts/Calendar';
import { Schedule } from './component/parts/Schedule';
import { GetIdentity, CreateProject, ReadProject, UpdateProject, DeleteProject } from './component/parts/Propose';
import { ProjectBoard, ProjectController, ProjectClipboard, ProjectDetail, Misc } from './component/admin/Admin';
import { UserInfo, RelatedProject } from './component/user/UserInfo';
import './_.css';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const today = new Date();
const api = axios.create({
	baseURL: `http://${process.env.REACT_APP_API_SERVER_HOST}:${process.env.REACT_APP_API_SERVER_PORT}`,
})

type sessionType = 1 | 2 | 3 | undefined;
type identityType = {
	name: string,
	mobileNumber: string
}
type pageModeType = 'logo' | 'readProject' | 'createProject' | 'updateProject' | 'deleteProject'
type reservationDataType = {RId: number, Rdevice: string, Rpayment: number, PId: number, Psubject: string, Pname: string, Pdate: Date, Psession: number}[];
type projectType = {
	project: {
		date: string,
		session: number,
		id: number,
		name: string,
		mobileNumber: string,
		subject: string,
		content: string,
		status: string,
		exposeCount: number,
		likeCount: number
	},
	reservation: {
		id: number,
		device: string,
		payment: boolean,
		check_payment: string,
		name: string,
		mobileNumber: string
	}[]
}

function App() {

	const initDate = today.getMonth()+1 <= 9 ? `${today.getFullYear()}-${'0'+(today.getMonth()+1)}-${today.getDate()}`
		: `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
	const [ theDay, setTheDay ] = useState<string>(initDate);
	const [ session, setSession ] = useState<sessionType>(undefined);
	const [ pageMode, setPageMode ] = useState<pageModeType>('logo');	//	화면 우측에 메인페이지를 뜻한다. (달력, 스케쥴, 로그인 등은 항상 존재하는 컨트롤러들)
	const [ identity, setIdentity ] = useState<identityType | undefined>(undefined);
	const [ isIdentified, setIsIdentified ] = useState<boolean>(false);
	const [ reservationRecord, setReservationRecord ] = useState<reservationDataType>([]);	//	중복 예약 막기 위해서 로그인한 유저의 모든 예약 내용을 업데이트한다.(그 달의)
	const [ selectedProject, setSelectedProject ] = useState<projectType | null>(null);
	const [ showDetail, setShowDetail ] = useState<boolean>(false);

	const [ adminIdentified, setAdminIdentified ] = useState<boolean>(false);
	const [ adminIdentity, setAdminIdentity ] = useState<{name: string, mobileNumber: string, identification: string}>({name: '', mobileNumber: '', identification: ''});
	const [ adminCookies, setAdminCookie, removeAdminCookie ] = useCookies(['adminLogin']);

	const [ mode, setMode ] = useState<0|1|2>(0);	//	 MAIN MODE

	useEffect(() => {
		setShowDetail(false);
	}, [selectedProject])

	useEffect(() => {
		if(identity !== undefined) setIsIdentified(true);
		else setIsIdentified(false);
	}, [identity])

	useEffect(() => {setPageMode('logo')}, [theDay])
	useEffect(() => {setIsIdentified(false)}, [session])

	//	pageMode에 따라 page(화면 우측의 메인 콘텐츠 제공 영역)에 보여줄 하위 컴포넌트를 생성한다.
	let page: JSX.Element | null = null;
	switch(pageMode){
		case 'logo':
			page = <img src="image/bird.png"/>;
			break;
		case 'readProject':
			page = <ReadProject theDay={theDay} session={session} />
			break;
		case 'createProject':
			if(!isIdentified) page = <GetIdentity setIdentity={setIdentity} session={session} />;
			else page = <CreateProject theDay={theDay} session={session} identity={identity} />;
			break;
		case 'updateProject':
			page = <UpdateProject />
			break;
		case 'deleteProject':
			page = <DeleteProject />
			break;
	}

	const modeUserInfo = 
		<div className="UserInfo">
			<UserInfo identity={identity} />
			<RelatedProject identity={identity} />
		</div>
	const modeApp = 
		<div className="App">
			<div>
				<Calendar setTheDay={setTheDay} setSession={setSession} setPageMode={setPageMode} pageMode={pageMode} />
			</div>
			<div>
				<Schedule theDay={theDay} setSession={setSession} setPageMode={setPageMode} identity={identity} reservationRecord={reservationRecord} setReservationRecord={setReservationRecord} />
			</div>
			<div>
				{page}
			</div>
			<div className="Login">
				<Login identity={identity} setIdentity={setIdentity} setReservationRecord={setReservationRecord} theDay={theDay} />
			</div>
		</div>
	const modeAdmin =
		<div className="Admin">
			<div>
				{selectedProject !== null && <div>언제 : {selectedProject?.project.date} ({selectedProject?.project.session})</div>}
				{selectedProject !== null && <div>누가 : {selectedProject?.project.name}, {selectedProject?.project.mobileNumber}</div>}
				{selectedProject !== null && <div>제목 : {selectedProject?.project.subject}</div>}
			</div>
			<ProjectBoard theDay={theDay} setSelectedProject={setSelectedProject} selectedProject={selectedProject} />
			<ProjectController selectedProject={selectedProject} setSelectedProject={setSelectedProject} setShowDetail={setShowDetail} showDetail={showDetail} />
			<ProjectClipboard selectedProject={selectedProject} />
			{showDetail && <ProjectDetail selectedProject={selectedProject} />}
			<Misc removeAdminCookie={removeAdminCookie} setMode={setMode} />
		</div>

	//	check adminLoginCookie
	useEffect(() => {
		if(adminCookies.adminLogin !== undefined){
			setAdminIdentity(adminCookies.adminLogin);
			setAdminIdentified(true);
		}else{
	//		setAdminIdentity({name: '', mobileNumber: '', identification: ''});
			setAdminIdentified(false);
		}
	})

	const onChangeAdminLoginInput = (e: any) => setAdminIdentity({...adminIdentity, [e.target.name]: e.target.value});
	const onClickAdminLoginBtn = async () => {
		const result = await api.get('/admin/login', {params: {...adminIdentity}});
		if(result.data){
			setAdminIdentified(result.data);
			setAdminCookie('adminLogin', adminIdentity, {maxAge: 60*60*6});		//	6 hours
		}
	}
	const ingressAdmin: JSX.Element =
		<div className="IngressAdmin">
			<input onChange={onChangeAdminLoginInput} name="name" placeholder="이름" />
			<input onChange={onChangeAdminLoginInput} name="mobileNumber" placeholder="전화번호" />
			<input onChange={onChangeAdminLoginInput} name="identification" placeholder="아이디" />
			<button onClick={onClickAdminLoginBtn}>login</button>
		</div>

	const modeGroup = [modeApp, modeUserInfo, adminIdentified !== false ? modeAdmin : ingressAdmin];

	return (
		<div className="root">
			<button onClick={()=>{setMode(0)}}>App</button>
			<button onClick={()=>{setMode(1)}}>UserInfo</button>
			<button onClick={()=>{setMode(2)}}>Admin</button>
			{modeGroup[mode]}
		</div>
	);
}

export default App;
