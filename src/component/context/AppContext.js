import { createContext, useCallback, useMemo, useEffect, useState } from "react";
import NoteService from "../../service/NoteService";
import UserService from "../../service/UserService";
import PartnersService from "../../service/PartnersService";


const AppContext = createContext();

export const AppProvider = ({ children }) => {

  const noteService = useMemo(() => new NoteService(), []);
  const partnersService = useMemo(() => new PartnersService(), []);
  const userService = new UserService();
  const [notes, setNotes] = useState([]);

  const [userPaw, setUserPaw] = useState(sessionStorage.getItem('userPaw'));
  const [taskType, setTaskType] = useState(["active", "partner"]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [partnerTask, setPartnerTask] = useState([
   
  ]);

  const [userId, setUserId] = useState(0);
  const [userName, setUserName] = useState("");
  const [updatedFunc, setUpdatedFunc] = useState("");

  const getAllPartners = useCallback(async () => {
    try {
      const data = await partnersService.getAllPartners();
      setPartnerTask(data);
    } catch (error) {
      console.error('Ortak görevleri alırken bir hata oluştu:', error);
    }
  }, [partnersService]);

  useEffect(() => {
    getAllPartners();
  }, [getAllPartners]);



  const [note, setNote] = useState({
    noteId: 0,
    userId: userId,
    text: "",
    date: "",
    isCompleted: "active"
  });

  useEffect(() => {
    setNote(prevNote => ({
      ...prevNote,
      userId: userId
    }));
  }, [userId]);

  // const getAllNotes = async (userId) => {
  //   try {
  //     const data = await noteService.getAllNotes(userId, taskType);
  //     setNotes(data);
  //   } catch (error) {
  //     console.error('Notları alırken bir hata oluştu:', error);
  //   }
  // };

  const getAllNotes = useCallback(async (userId) => {
    try {
      const data = await noteService.getAllNotes(userId, taskType);
      setNotes(data);
    } catch (error) {
      console.error('Notları alırken bir hata oluştu:', error);
    }
  }, [taskType, noteService]);

  useEffect(() => {
    if (userId) {
      getAllNotes(userId);
    }
  }, [userId, getAllNotes, updatedFunc]);

  // useEffect(() => {
  //   if (userId) {
  //     getAllNotes(userId);
  //   }
  // }, [userId, taskType, updatedFunc]);

  const postOneNote = (note) => {
    noteService.postOneNote(note).then((response) => setNotes([...notes, response]))
  }

  const putOneNote = (id, note) => {
    noteService.updateOneNote(id, note)
      .then(() => {
        setUpdatedFunc("updated");
        setTimeout(() => {
          setUpdatedFunc("");
        }, 1);
      });
  };



  const deleteOneNote = (id) => {
    noteService
      .deleteOneNote(id)
      .then((response) => {
        setUpdatedFunc("deleted");
        setTimeout(() => {
          setUpdatedFunc("");
        }, 1);
      });
  };

  const deleteAllNotes = () => {
    noteService.deleteAllNotes().then(() => setNotes([]));
  }

  const clickFunc = async (e) => {
    e.preventDefault();
    e.target.disabled = true;
  
    if (note.text.trim().length !== 0) {
      postOneNote(note);
      const updatePawValue = await userService.updateUserPaw(userId, 1);
      sessionStorage.setItem('userPaw', updatePawValue);
      setUserPaw(updatePawValue);
    }
  
    // 1 saniye sonra butonu tekrar etkinleştir
    setTimeout(() => {
      e.target.disabled = false;
    }, 1000);
  
    // Formu temizle
    setNote({
      noteId: 0,
      userId: userId,
      text: "",
      date: "",
      isCompleted: "active"
    });
  }
  


  const clickChange = (e) => {
    setNote({
      ...note,
      [e.target.name]: e.target.value
    });
  }

  const partnerKabul = async () => {
    postOneNote(note);
    const updatePawValue = await userService.updateUserPaw(userId, 1);
    sessionStorage.setItem('userPaw', updatePawValue);
    setUserPaw(updatePawValue);
    setNote({
      noteId: 0,
      userId: userId,
      text: "",
      date: "",
      isCompleted: "active"
    });
  }

  const clearFunc = () => {
    setNote({
      noteId: 0,
      userId: userId,
      text: "",
      date: "",
      isCompleted: "active"
    })
  }

  const deleteFunc = async (id) => {
    deleteOneNote(id);
    if (taskType.includes("active")) {
      const updatePawValue = await userService.updateUserPaw(userId, -1);
      sessionStorage.setItem('userPaw', updatePawValue);
      setUserPaw(updatePawValue);
    }
  };

  const completedFunc = async (id, isCompleted) => {
    const note = {
      isCompleted: "completed"
    }
    putOneNote(id, note);
    if (isCompleted === "active") {
      const updatePawValue = await userService.updateUserPaw(userId, 3);
      sessionStorage.setItem('userPaw', updatePawValue);
      setUserPaw(updatePawValue);
    } else {
      const updatePawValue = await userService.updateUserPaw(userId, 30);
      sessionStorage.setItem('userPaw', updatePawValue);
      setUserPaw(updatePawValue);
    }
  }

  const archivedFunc = async (id) => {
    const note = {
      isCompleted: "archived"
    }
    putOneNote(id, note);
  }

  const activedFunc = async (id) => {
    const note = {
      isCompleted: "active"
    }
    putOneNote(id, note);
  }


  const effectiveButton = (type) => {
    setTaskType(type);
  }




  const values = {
    note,
    setNote,
    notes,
    setNotes,
    getAllNotes,
    postOneNote,
    putOneNote,
    deleteOneNote,
    deleteAllNotes,
    clickChange,
    clickFunc,
    deleteFunc,
    clearFunc,
    userPaw,
    userId,
    taskType,
    setTaskType,
    filteredNotes,
    setFilteredNotes,
    effectiveButton,
    userName,
    setUserId,
    setUserName,
    completedFunc,
    archivedFunc,
    activedFunc,
    partnerTask,
    partnerKabul
  };

  return <AppContext.Provider value={values}>{children}</AppContext.Provider>;
};

export default AppContext;