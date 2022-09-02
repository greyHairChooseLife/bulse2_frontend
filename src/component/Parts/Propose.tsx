import React, { useState, useEffect } from 'react';
import './_.css';
import axios from 'axios';

const api = axios.create({
	baseURL: `http://${process.env.REACT_APP_API_SERVER_HOST}:${process.env.REACT_APP_API_SERVER_PORT}`,
})

type sessionType = 1 | 2 | 3 | undefined;
interface IgetIdentityProps {
	setIdentity: any
	session:sessionType 
}
export const GetIdentity = (props: IgetIdentityProps) => {
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


interface IcreateProject {
	theDay: string
	session: number | undefined
	identity: {name: string, mobileNumber: string} | undefined
}
export const CreateProject = (props: IcreateProject) => {
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

export const UpdateProject = () => {
	return (
		<div>
			update project component
		</div>
	)
}

export const DeleteProject = () => {
	return (
		<div>
			delete project component
		</div>
	)
}
