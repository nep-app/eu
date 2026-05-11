import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged,
} from "firebase/auth";
import {
  doc, getDoc, setDoc, collection, addDoc, onSnapshot, updateDoc, deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "./firebase";

var BG = "#eef1f6";
var CARD = { background:"white", borderRadius:20, padding:"18px 20px", marginBottom:14, boxShadow:"0 2px 12px rgba(15,23,42,0.07),0 0 0 1px rgba(15,23,42,0.04)" };
var SL = { fontSize:10, fontWeight:800, letterSpacing:1.5, textTransform:"uppercase", color:"#94a3b8", marginBottom:10 };
var PS = {
  urgent:  { dot:"#ef4444", bg:"#fff1f2", badge:"URGENTE",   bc:"#ef4444", bl:"#fecaca" },
  pending: { dot:"#f59e0b", bg:"#fffbf0", badge:"POR FAZER", bc:"#d97706", bl:"#fde68a" },
  new:     { dot:"#6366f1", bg:"#f5f3ff", badge:"NOVO",      bc:"#4f46e5", bl:"#c7d2fe" },
};
