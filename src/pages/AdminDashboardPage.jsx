import React,{useCallback,useRef} from "react";
import user from "../assets/images/user.svg";
import update from 'immutability-helper'
import image1 from "../assets/images/img1.svg";
import Ninja from "../assets/images/ninja.svg";
import Arrow from "../assets/images/arrow.svg";
import MkdSDK from "../utils/MkdSDK";
import { AuthContext } from "../authContext";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
const jsonObjectType = "jsonObject";
const JSONObject = ({ id, title, username, photo, like, index,moveCard }) => {
    const ref = useRef(null)
    const [{ handlerId }, drop] = useDrop({
      accept: jsonObjectType,
      collect(monitor) {
        return {
          handlerId: monitor.getHandlerId(),
        }
      },
      hover(item, monitor) {
        if (!ref.current) {
          return
        }
        const dragIndex = item.index
        const hoverIndex = index
        if (dragIndex === hoverIndex) {
          return
        }
        const hoverBoundingRect = ref.current?.getBoundingClientRect()
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
        const clientOffset = monitor.getClientOffset()
        const hoverClientY = clientOffset.y - hoverBoundingRect.top
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return
        }
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return
        }
        moveCard(dragIndex, hoverIndex)
        item.index = hoverIndex
      },
    })
    const [{ isDragging }, drag] = useDrag({
      type: jsonObjectType,
      item: () => {
        return { id, index }
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    })
    const opacity = isDragging ? 0 : 1
    drag(drop(ref))
    return (
        <tr
        ref={ref}
        data-handler-id={handlerId}
            style={{
                cursor: "move",
            }}
            key={id}
        >
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
const JSONList = ({ jsonObjects }) => {
    const [data, setData] = React.useState(jsonObjects);
    React.useEffect(() => {
            setData(jsonObjects);
    }, [jsonObjects]);
    const moveCard = useCallback((dragIndex, hoverIndex) => {
        setData((prevCards) =>
          update(prevCards, {
            $splice: [
              [dragIndex, 1],
              [hoverIndex, 0, prevCards[dragIndex]],
            ],
          }),
        )
      }, [])
    return (
        <table  class='table-auto'>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Most Liked</th>
                </tr>
            </thead>
            <tbody>
                {data.length > 0 &&
                    data.map((jsonObject, index) => (
                        <JSONObject key={jsonObject.id} {...jsonObject} index={index} moveCard={moveCard} />
                    ))}
            </tbody>
        </table>
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
    const currentdate = new Date();
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
                            26 April 2023
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
                            {currentdate.getHours() +
                                ":" +
                                currentdate.getMinutes() +
                                ":" +
                                currentdate.getSeconds()}
                        </span>
                    </div>
                </div>
                <div className='adminTable'>
                    <DndProvider backend={HTML5Backend}>
                        <JSONList jsonObjects={data?.list} />
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
                            style={{ width: '100px' }}
                        >
                            Previous
                        </button>
                        <button
                            disabled={data?.currentPage === data?.pages}
                            onClick={() => setPage((prevPage) => prevPage + 1)}
                            class='mx-2 px-2 py-1 bg-gray-300 text-gray-800 rounded-lg'
                            style={{ width: '100px' }}
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