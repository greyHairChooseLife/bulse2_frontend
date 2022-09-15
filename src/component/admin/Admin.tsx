import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import './_.css';
import axios from 'axios';

const api = axios.create({
	baseURL: `http://${process.env.REACT_APP_API_SERVER_HOST}:${process.env.REACT_APP_API_SERVER_PORT}`,
})

interface IProjectBoard {
	theDay: string
	setSelectedProject: Dispatch<SetStateAction<projectType | null>>
}
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
		name: string,
		mobileNumber: string
	}[]
}

export const ProjectBoard = (props: IProjectBoard) => {

	const [ project, setProject ] = useState<projectType[]>([]);

	//	theDay가 속하는 달의 project를 업데이트 해 준다.
	useEffect(() => {
		const theMonth = props.theDay.split('-')[1];
		const getProject = async () => {
			const result = await api.get('/project/month', {params: {theMonth: theMonth}})
			setProject(result.data.map((ele: any) => {
				//	타임존 반영해서 형식 변경
				const origin = new Date(ele.project.date);
				ele.project.date = `${origin.getFullYear()}-${origin.getMonth()+1 <= 9 ? '0'+(origin.getMonth()+1) : origin.getMonth()+1}-${origin.getDate() <= 9 ? '0' + origin.getDate() : origin.getDate()}`;
				return {...ele};
			}));
		}
		getProject();
	}, [props.theDay])

	const selectProject = (ele: any) => {
		props.setSelectedProject(ele);
	}

	return (
		<div className="Board">
			<table>
				<thead>
					<tr>
						<th>date</th>
						<th>session</th>
						<th>status</th>
						<th>subject</th>
						<th>name / number</th>
						<th>expose</th>
						<th>like</th>
						<th>reservated</th>
						<th>paid ratio</th>
						<th>id</th>
					</tr>
				</thead>
				<tbody>
					{project.map((e: any, idx: number, arr: any) => {
						const paidCount = e.reservation.reduce((prev: any, curr: any) => {return curr.payment !== 0 ? prev+1 : prev}, 0)
						return (
							<tr key={'tr_No.'+idx} onClick={() => selectProject(e)}>
								<th>{idx === 0 ? e.project.date.substr(5) : arr[idx-1].project.date !== e.project.date ? e.project.date.substr(5) : ''}</th>
								<th>{e.project.session}</th>
								{e.project.status === 'pending' ? <th className="StatusPending">{e.project.status}</th>
								: e.project.status === 'recruiting' ? <th className="StatusRecruiting">{e.project.status}</th>
								: e.project.status === 'confirmed' ? <th className="StatusConfirmed">{e.project.status}</th>
								: null}
								<th>{e.project.subject.substr(0, 7)}{e.project.subject.length > 7 && '...'}</th>
								<th>{e.project.name} / {e.project.mobileNumber.substr(3, 4)+'-'+e.project.mobileNumber.substr(7, 4)}</th>
								<th>{e.project.exposeCount}</th>
								<th>{e.project.likeCount}</th>
								<th>{e.reservation.length}</th>
								<th>{paidCount}/{e.reservation.length}</th>
								<th>{e.project.id}</th>
							</tr>
						)
					})}
				</tbody>
			</table>
		</div>
	)
}

interface IProjectController {
	selectedProject: projectType | null
	showDetail: boolean
	setShowDetail: Dispatch<SetStateAction<boolean>>
}
export const ProjectController = (props: IProjectController) => {

	const switchDetail = () => {
		props.setShowDetail(!props.showDetail);
	}

	let actions = null;
	switch(props.selectedProject?.project.status){
		case 'pending':
			actions = 
				<>
					<button onClick={switchDetail}>상세 보기</button>
					<button>승인</button>
					<button>반려</button>
				</>
			break;
		case 'recruiting':
			actions = 
				<>
					<button onClick={switchDetail}>상세 보기</button>
					<button>강제 취소</button>
				</>
			break;
		case 'confirmed':
			actions = 
				<>
					<button onClick={switchDetail}>상세 보기</button>
					<button>강제 취소</button>
				</>
			break;
//		case 'rejected':
//			break;
//		case 'canceled':
//			break;
	}

	return (
		<div className="Controller">
			{actions}
		</div>
	)
}

interface IProjectClipboard {
	selectedProject: projectType | null
}
export const ProjectClipboard = (props: IProjectClipboard) => {
	return (
		<div className="Clipboard">
			<div>
				{props.selectedProject?.project.date}
			</div>
			<div>
				{props.selectedProject?.project.subject}
			</div>
			<div>
				{props.selectedProject?.project.name}
			</div>
		</div>
	)
}

interface IProjectDetail {
	selectedProject: projectType | null
}
export const ProjectDetail = (props: IProjectDetail) => {
	return (
		<div className="Detail">
			<div>
				{props.selectedProject?.project.subject}
			</div>
			<div>
				{props.selectedProject?.project.content}
			</div>
		</div>
	)
}
