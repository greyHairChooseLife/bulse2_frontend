import React, { useState, useEffect } from 'react';
import { Login } from './component/parts/Login';
import { Calendar } from './component/parts/Calendar';
import { Schedule } from './component/parts/Schedule';
import { CreateProject, ReadProject } from './component/parts/Pages';
import { ProjectBoard, ProjectController, ProjectClipboard, ProjectDetail, SelectedProjectSummary } from './component/admin/Admin';
import { UserController, RelatedProject, UserInfoModal } from './component/user/UserInfo';
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
	const [ reservationRecord, setReservationRecord ] = useState<reservationDataType>([]);	//	중복 예약 막기 위해서 로그인한 유저의 모든 예약 내용을 업데이트한다.(그 달의)
	const [ selectedProject, setSelectedProject ] = useState<projectType | null>(null);
	const [ showDetail, setShowDetail ] = useState<[boolean, string]>([false, '']);
	const [ selectedBP, setSelectedBP ] = useState<projectType | null>(null);

	const [ updateSchedule, setUpdateSchedule ] = useState<boolean>(true);	//	create프로젝트 완료했을 때 schedule component를  re-render 해 주기 위해서
	const [ updateAdmin, setUpdateAdmin ] = useState<boolean>(true);	//	admin component를  re-render 해 주기 위해서

	const [ adminIdentified, setAdminIdentified ] = useState<boolean>(false);
	const [ adminIdentity, setAdminIdentity ] = useState<{name: string, mobileNumber: string, identification: string}>({name: '', mobileNumber: '', identification: ''});
	const [ adminCookies, setAdminCookie, removeAdminCookie ] = useCookies(['adminLogin']);

	const [ mode, setMode ] = useState<0|1|2>(0);	//	 MAIN MODE

	const [ userSelectedReservation, setUserSelectedReservation ] = useState<any | null>(null);
	const [ userSelectedProposal, setUserSelectedProposal ] = useState<any | null>(null);
	const [ readUserSelected, setRUS ] = useState<any>([false, undefined]);	//	relatedProject를 띄울지 selected Project의 상세내용을 보여줄지 판별
	const [ cancelReservationAway, setCRA] = useState<boolean>(false);	//	userInfo화면에서 예약 취소하면 Schedul component의 state를 업데이트 해야 한다.

	useEffect(() => {
		setShowDetail([false, '']);
	}, [selectedProject])

	useEffect(() => {setPageMode('logo')}, [theDay])

 //명함 또는 첫 인삿말 페이지로으로 쓰자.
//				<div className="Logo">
//					<img src="image/bird.png"/>
//					<div>
//						<p>흥미로울 만큼 충분히 가까운,<br />부담없을 만큼 충분히 분리된 관계를 만듭니다.</p>
//						<p>말하고 들어요, 우리</p>
//						<br />
//						<br />
//						<p>벌새</p>
//						<p>대성로 55</p>
//						<p>010.9639.7703</p>
//					</div>
//				</div>;
	//	pageMode에 따라 page(화면 우측의 메인 콘텐츠 제공 영역)에 보여줄 하위 컴포넌트를 생성한다.
	let page: JSX.Element | null = null;
	switch(pageMode){
		case 'logo':
			page = 
				<div className="EmptyPage">
					<p>" <span className="UnderLine">날짜</span>를 선택하고 <span className="UnderLine">일정</span>을 둘러보세요.</p>
					<p><span className="UnderLine">빈 자리</span>에는 <span className="UnderLine">새로운 일정</span>을 제안 할 수 있습니다. "</p>
				</div>;
			break;
		case 'readProject':
			page = <ReadProject theDay={theDay} session={session} />
			break;
		case 'createProject':
			page = <CreateProject theDay={theDay} session={session} identity={identity} setPageMode={setPageMode} setUpdateSchedule={setUpdateSchedule} updateSchedule={updateSchedule} />;
			break;
	}

	const modeApp = 
		<div className="App">
			<Calendar setTheDay={setTheDay} setSession={setSession} setPageMode={setPageMode} pageMode={pageMode} />
			<Schedule theDay={theDay} setSession={setSession} session={session} updateSchedule={updateSchedule} setPageMode={setPageMode} identity={identity} reservationRecord={reservationRecord} setReservationRecord={setReservationRecord} cancelReservationAway={cancelReservationAway} setCRA={setCRA} />
			{identity !== undefined && page}
		</div>
	const modeUserInfo = 
		<div className="UserInfo">
			<UserController userSelectedReservation={userSelectedReservation} userSelectedProposal={userSelectedProposal} setRUS={setRUS} readUserSelected={readUserSelected} setUserSelectedReservation={setUserSelectedReservation} setUserSelectedProposal={setUserSelectedProposal} setCRA={setCRA} />
			{!readUserSelected[0] ?
				<RelatedProject identity={identity} setUserSelectedReservation={setUserSelectedReservation} setUserSelectedProposal={setUserSelectedProposal} userSelectedReservation={userSelectedReservation} userSelectedProposal={userSelectedProposal} /> 
				: <UserInfoModal userSelectedReservation={userSelectedReservation} userSelectedProposal={userSelectedProposal} readUserSelected={readUserSelected} />}
		</div>
	const modeAdmin =
		<div className="Admin">
			<SelectedProjectSummary selectedProject={selectedProject} />
			<ProjectBoard theDay={theDay} setSelectedProject={setSelectedProject} selectedProject={selectedProject} updateAdmin={updateAdmin} setSelectedBP={setSelectedBP} />
			<ProjectController selectedProject={selectedProject} setSelectedProject={setSelectedProject} setShowDetail={setShowDetail} showDetail={showDetail} />
			<ProjectClipboard selectedProject={selectedProject} updateAdmin={updateAdmin} setUpdateAdmin={setUpdateAdmin} />
			{showDetail[0] && (showDetail[1] !== 'broken' ? <ProjectDetail showWhat='projectDetail' selectedProject={selectedProject} selectedBP={selectedBP} /> 
													: <ProjectDetail showWhat='brokenComment' selectedProject={selectedProject} selectedBP={selectedBP} />)}
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
		}else{
			setLoginFailMsg('틀렸습니다. 다시 한번 확인 해 주세요.');
			setTimeout(() => {setLoginFailMsg(null)}, 1500)
		}
	}
	const [ loginFailMsg, setLoginFailMsg ] = useState<string | null>(null);
	const ingressAdmin: JSX.Element =
		<div className="IngressAdmin">
			<input onChange={onChangeAdminLoginInput} name="name" placeholder="이름" />
			<input onChange={onChangeAdminLoginInput} name="mobileNumber" placeholder="전화번호" />
			<input onChange={onChangeAdminLoginInput} name="identification" placeholder="아이디" />
			<button onClick={onClickAdminLoginBtn}>login</button>
			<p>- 6시간 동안 유지됩니다.<br />- 문의 010_9639_7703</p>
			{loginFailMsg !== null && <span>{loginFailMsg}</span>}
		</div>

	const modeGroup = [modeApp, modeUserInfo, adminIdentified !== false ? modeAdmin : ingressAdmin];

	return (
		<div className="root">
			{mode !== 1 && <img className="AdminBtn" onClick={()=>{
				if(mode !== 2) setMode(2)
				else{
					if(adminIdentified){
						if(window.confirm('로그아웃 하시겠습니까?')){
							removeAdminCookie('adminLogin');
							setMode(0);
						}
					}else{
						removeAdminCookie('adminLogin');
						setMode(0);
					}
				}
			}} src={mode !== 2 ? "image/admin.png" : "image/cancel.png"}/>}
			{mode !== 2 && <Login identity={identity} setIdentity={setIdentity} setReservationRecord={setReservationRecord} theDay={theDay} setMode={setMode} mode={mode} setUserSelectedReservation={setUserSelectedReservation} setUserSelectedProposal={setUserSelectedProposal} setRUS={setRUS} />}
			{modeGroup[mode]}
		</div>
	);
}

export default App;
