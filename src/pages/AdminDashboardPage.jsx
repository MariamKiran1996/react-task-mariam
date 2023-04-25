import React from "react";
import user from "../assets/images/user.svg";
import image1 from "../assets/images/img1.svg";
import Ninja from "../assets/images/ninja.svg";
import Arrow from "../assets/images/arrow.svg";
import MkdSDK from "../utils/MkdSDK";
import { AuthContext } from "../authContext";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { set } from "react-hook-form";

// Define the JSON object type
const jsonObjectType = "jsonObject";

// Example JSON objects
const jsonObjects = [
	{ id: 1, title: "Object 1" },
	{ id: 2, title: "Object 2" },
	{ id: 3, title: "Object 3" },
];

// Component that displays a JSON object
const JSONObject = ({ id, title, username, photo, like, index }) => {
	const [{ isDragging }, dragRef] = useDrag(() => ({
		type: jsonObjectType,
		item: { id, index,source: "DRAGGED_ITEM" },
		collect: (monitor) => ({
			isDragging: !!monitor.isDragging(),
		}),
	}));

	return (
		
			<tr key={id} ref={dragRef}
			style={{
				// opacity: isDragging ? 0.5 : 1,
				cursor: "move",
			}}>
				<td>{id}</td>
				<td>
					{" "}
					<div>
						<img src={photo}></img> {title}
					</div>
				</td>
				<td>
					<div>
						<img src={Ninja}></img>
						{username}
					</div>
				</td>
				<td>
					<div>
						{like}
						<img src={Arrow}></img>
					</div>
				</td>
			</tr>
		
	);
};

// Component that displays a list of JSON objects
const JSONList = ({ jsonObjects }) => {
	const [data, setData] = React.useState(jsonObjects);
	React.useEffect(() => {
		if (jsonObjects) {
			setData(jsonObjects);
		}
	}, [jsonObjects]);
	
	const [{ canDrop, isOver }, dropRef] = useDrop(() => ({
		accept: jsonObjectType,
		canDrop:(item, monitor)=>{
console.log(monitor.getItem(),"monitor.getItem()")
		},  hover(item, monitor) {
			if (!ref.current) {
			  return;
			}
			const dragIndex = item.index;
			const hoverIndex = getIndex(ref.current);
			if (dragIndex === hoverIndex) {
			  return;
			}
			moveItem(dragIndex, hoverIndex);
			item.index = hoverIndex;
		  },
		drop: (item, monitor) => {
			// Handle drop logic here
			console.log(monitor.getDropResult(), "monitor",monitor.didDrop());
			let newList = [...jsonObjects];

			const toIndex = 2;
			const element = newList.splice(item.index, 1)[0];
			newList.splice(toIndex, 0, element);
			setData(newList);
			console.log(newList);
			console.log("Dropped JSON object:", item);
		},
		collect: (monitor) => ({
			
			canDrop: !!monitor.canDrop(),
			isOver: !!monitor.isOver(),
		}),

	}));
	const moveItem = (dragIndex, hoverIndex) => {
		const draggedItem = items[dragIndex];
		// Use the spread operator to create a new array with the item moved to the new index
		const newItems = [...items];
		newItems.splice(dragIndex, 1);
		newItems.splice(hoverIndex, 0, draggedItem);
		// Update the state with the new array
		console.log
		
	  };
	const getIndex = (node) => {
		const index = [...node.parentNode.children].indexOf(node);
		console.log("index", index);
		return index;
	  };

	return (
		<div
			ref={dropRef}
			style={{
				// border: canDrop ? "2px dashed #333" : "1px solid #ccc",
				// padding: '16px',
				// margin: '16px'
			}}
		>
			<table class='table-auto'>
				<thead>
					<tr>
						<th>#</th>
						<th>Title</th>
						<th>Author</th>
						<th>Most Liked</th>
					</tr>
				</thead>
				<tbody>
					{data.length>0 &&
						data.map((jsonObject, index) => (
							<JSONObject key={jsonObject.id} {...jsonObject} index={index} />
						))}
				</tbody>
			</table>
		</div>
	);
};
const AdminDashboardPage = () => {
	const sdk = new MkdSDK();
	const { state, dispatch } = React.useContext(AuthContext);
	const [data, setData] = React.useState({
		list: [],
		pages: 0,
		total: 0,
		currentPage: 1,
	});
	const [page, setPage] = React.useState(1);

	React.useEffect(() => {
		apiCall("PAGINATE");
	}, [page]);

	const apiCall = async (method) => {
		sdk
			.callRestAPI(
				{ payload: {}, page: page, limit: 10, id: state.user_id },
				method
			)
			.then((jsonGet) => {
				setData({
					list: jsonGet.list,
					pages: jsonGet.num_pages,
					total: jsonGet.total,
					currentPage: jsonGet.page,
				});
				setPage(jsonGet.page);
			});
	};

	return (
		<>
			<div
				className='w-full mx-auto bg-black py-4 px-14 '
				style={{ minHeight: "100vh" }}
			>
				<div class='flex justify-between align-center mb-16'>
					<a
						href='#'
						className='text-white'
						style={{
							fontWeight: "900",
							fontSize: "48px",
						}}
					>
						APP
					</a>
					<button
						class='self-center rounded-full bg-lime-400 px-4 py-2.5 flex'
						onClick={() =>
							dispatch({
								type: "LOGOUT",
							})
						}
					>
						<img src={user}></img> Logout
					</button>
				</div>
				<div class='flex justify-between align-center mb-10'>
					<h6
						className='text-white'
						style={{
							fontWeight: "100",
							fontSize: "40px",
						}}
					>
						Today’s leaderboard
					</h6>
					<div
						style={{ background: "#1D1D1D" }}
						className='flex justify-center align-center rounded-[16px] py-2 px-6 self-center'
					>
						<span
							className='text-white'
							style={{ fontWeight: "100", fontSize: "16px" }}
						>
							30 May 2022
						</span>{" "}
						<p
							style={{ fontSize: "14px", fontWeight: "100" }}
							className='dot text-black uppercase self-center rounded-[8px] bg-lime-400 px-1 py-1 flex mx-5'
						>
							Submissions OPEN
						</p>{" "}
						<span
							className='dot text-white'
							style={{ fontWeight: "100", fontSize: "16px" }}
						>
							11:34
						</span>
					</div>
				</div>

				<div className='adminTable'>
					<DndProvider backend={HTML5Backend}>
						<div>
							<JSONList jsonObjects={data?.list} />
						</div>
					</DndProvider>
					{/* <table class='table-auto'>
						<thead>
							<tr>
								<th>#</th>
								<th>Title</th>
								<th>Author</th>
								<th>Most Liked</th>
							</tr>
						</thead>
						<tbody>
					
						
							{data &&
								data?.list?.map((item, index) => (
									<tr key={index}>
										<td>{item?.id}</td>
										<td>
											{" "}
											<div>
												<img src={item?.photo}></img> {item.title}
											</div>
										</td>
										<td>
											<div>
												<img src={Ninja}></img>
												{item?.username}
											</div>
										</td>
										<td>
											<div>
												{item?.like}
												<img src={Arrow}></img>
											</div>
										</td>
									</tr>
								))}
						</tbody>
					</table> */}
				</div>
				<div class='flex items-center justify-between my-3'>
					<div class='flex items-center justify-center'>
						<button
							disabled={data?.currentPage === 1}
							onClick={() => setPage((prevPage) => prevPage - 1)}
							class='mx-2 px-2 py-1 bg-gray-300 text-gray-800 rounded-lg'
							style={{width:'100px'}}
						>
							Previous
						</button>

						<button
							disabled={data?.currentPage === data?.pages}
							onClick={() => setPage((prevPage) => prevPage + 1)}
							class='mx-2 px-2 py-1 bg-gray-300 text-gray-800 rounded-lg'
							style={{width:'100px'}}
						>
							Next
						</button>
					</div>
					<div class='flex items-center justify-center'>
					<div class='ml-4 text-gray-600'>
						<span class='mr-1'>Total Pages:</span>
						<span>{data && data?.pages}</span>
					</div>
					<div class='ml-4 text-gray-600'>
						<span class='mr-1'>Current Page:</span>
						<span>{data && data?.currentPage}</span>
					</div>
					<div class='ml-4 text-gray-600'>
						<span class='mr-1'>Total Items:</span>
						<span>{data && data?.total}</span>
					</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default AdminDashboardPage;
