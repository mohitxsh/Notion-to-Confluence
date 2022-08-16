import React, { useState, useEffect } from "react";
import { EditorState, ContentState, convertFromHTML, convertToRaw } from "draft-js";
import Editor from '@draft-js-plugins/editor';
import createToolbarPlugin from '@draft-js-plugins/static-toolbar';
import axios from 'axios';
import '@draft-js-plugins/static-toolbar/lib/plugin.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import editorStyles from './editorStyles.module.scss';

const staticToolbarPlugin = createToolbarPlugin();
const { Toolbar } = staticToolbarPlugin;
const plugins = [staticToolbarPlugin];

export default function MyEditor({ title, pagecontents }) {

  const [editorStateAccess, setEditorStateAccess] = useState();  
  const [editorData, setEditorData] = useState();

  const content = ContentState.createFromText(title);

  const notify = (responseMessage) => toast(responseMessage)

  const getParagraphs = () => {
    const arrayPara = [];
    if(pagecontents){
        // eslint-disable-next-line
        pagecontents.map((p) => {
            if(p.paragraph.rich_text[0]){
                (
                    arrayPara.push(p.paragraph.rich_text[0].plain_text)
                )
            }
        })
    }
    return (
        `<h1>${title}</h1>
        ${arrayPara}
        `
    );
  }

  const convertedMarkup = getParagraphs()

  const blocksFromHTML = convertFromHTML(convertedMarkup);

  const [editorState, setEditorState] = useState(() =>
    EditorState.createWithContent(content)
  );
  useEffect(() => {
    const state = title
      ? EditorState.createWithContent(ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap,
      ))
      : EditorState.createEmpty()
    setEditorState(state);
     // eslint-disable-next-line
  }, [title]); 

  useEffect(() => {
    setEditorStateAccess(editorState.getCurrentContent());
  }, [editorState])

  const onButtonClick = () => {
    const contentState = editorStateAccess;
    setEditorData(convertToRaw(contentState).blocks);
  }


  useEffect(() => {
    
    if(editorData){
        const pageContentArray = [];
        for(let i=1; i<editorData.length;i++){
            pageContentArray.push(editorData[i].text)
        }
        axios({
            method: 'post',
            url: 'https://api.atlassian.com/ex/confluence/bcb41450-0908-4c0b-bcac-479ac81afbaf/rest/api/content',
            headers: { 
                'Authorization': 'Bearer eyJraWQiOiJmZTM2ZThkMzZjMTA2N2RjYTgyNTg5MmEiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2MmY4ZjEzMGQ3NWY1MjNhNjBlZDJmYTgiLCJuYmYiOjE2NjA2NTA4MDAsImlzcyI6Imh0dHBzOi8vYXRsYXNzaWFuLWFjY291bnQtcHJvZC5wdXMyLmF1dGgwLmNvbS8iLCJpYXQiOjE2NjA2NTA4MDAsImV4cCI6MTY2MDY1NDQwMCwiYXVkIjoidzRJM3BxcU41YnRHb1NZRjdURkNSalk2OGlBakNyTHAiLCJqdGkiOiJkMWE2NzhlMi01OTVjLTRiYmUtYWQ3Yy0zYjVkMWFlZmQ4ZDMiLCJodHRwczovL2F0bGFzc2lhbi5jb20vdmVyaWZpZWQiOnRydWUsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9zZXNzaW9uX2lkIjoiZWYwYmY1MDAtN2E5Ni00M2IyLTgxZmYtNzk4YzI2NDVlMjgxIiwiY2xpZW50X2lkIjoidzRJM3BxcU41YnRHb1NZRjdURkNSalk2OGlBakNyTHAiLCJjbGllbnRfYXV0aF90eXBlIjoiUE9TVCIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9zeXN0ZW1BY2NvdW50RW1haWwiOiJjMTgxZGJjMC02YzAxLTRiMTgtODVlOC1jYjU1MmQ0YjY2ZmNAY29ubmVjdC5hdGxhc3NpYW4uY29tIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL3VqdCI6Ijg3ZDY4MzM2LWY2ZTctNDcwOC1iNzYyLWJiYzU0NGMzZTRkMSIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS92ZXJpZmllZCI6InRydWUiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vYXRsX3Rva2VuX3R5cGUiOiJBQ0NFU1MiLCJzY29wZSI6InJlYWQ6dXNlci5wcm9wZXJ0eTpjb25mbHVlbmNlIGRlbGV0ZTpzcGFjZTpjb25mbHVlbmNlIHJlYWQ6Y29tbWVudDpjb25mbHVlbmNlIHdyaXRlOnRlbXBsYXRlOmNvbmZsdWVuY2UgcmVhZDpzcGFjZS1kZXRhaWxzOmNvbmZsdWVuY2UgcmVhZDpibG9ncG9zdDpjb25mbHVlbmNlIHJlYWQ6c3BhY2UucGVybWlzc2lvbjpjb25mbHVlbmNlIHJlYWQ6YW5hbHl0aWNzLmNvbnRlbnQ6Y29uZmx1ZW5jZSByZWFkOmlubGluZXRhc2s6Y29uZmx1ZW5jZSBkZWxldGU6YXR0YWNobWVudDpjb25mbHVlbmNlIHJlYWQ6dGVtcGxhdGU6Y29uZmx1ZW5jZSB3cml0ZTpibG9ncG9zdDpjb25mbHVlbmNlIHJlYWQ6Y29udGVudC5tZXRhZGF0YTpjb25mbHVlbmNlIHdyaXRlOmxhYmVsOmNvbmZsdWVuY2UgZGVsZXRlOnBhZ2U6Y29uZmx1ZW5jZSByZWFkOmNvbmZpZ3VyYXRpb246Y29uZmx1ZW5jZSB3cml0ZTpjdXN0b20tY29udGVudDpjb25mbHVlbmNlIHJlYWQ6Y29udGVudDpjb25mbHVlbmNlIHJlYWQ6YXR0YWNobWVudDpjb25mbHVlbmNlIHJlYWQ6bGFiZWw6Y29uZmx1ZW5jZSB3cml0ZTpzcGFjZTpjb25mbHVlbmNlIHJlYWQ6d2F0Y2hlcjpjb25mbHVlbmNlIHJlYWQ6Y3VzdG9tLWNvbnRlbnQ6Y29uZmx1ZW5jZSB3cml0ZTp1c2VyLnByb3BlcnR5OmNvbmZsdWVuY2UgcmVhZDpzcGFjZS5wcm9wZXJ0eTpjb25mbHVlbmNlIHdyaXRlOmNvbnRlbnQ6Y29uZmx1ZW5jZSBkZWxldGU6Y29tbWVudDpjb25mbHVlbmNlIHdyaXRlOmF0dGFjaG1lbnQ6Y29uZmx1ZW5jZSByZWFkOmdyb3VwOmNvbmZsdWVuY2Ugd3JpdGU6aW5saW5ldGFzazpjb25mbHVlbmNlIHJlYWQ6cGFnZTpjb25mbHVlbmNlIHJlYWQ6c3BhY2U6Y29uZmx1ZW5jZSB3cml0ZTpzcGFjZS5wZXJtaXNzaW9uOmNvbmZsdWVuY2UgcmVhZDpzcGFjZS5zZXR0aW5nOmNvbmZsdWVuY2Ugd3JpdGU6d2F0Y2hlcjpjb25mbHVlbmNlIHdyaXRlOnNwYWNlLnNldHRpbmc6Y29uZmx1ZW5jZSB3cml0ZTpjb250ZW50LnJlc3RyaWN0aW9uOmNvbmZsdWVuY2Ugd3JpdGU6cmVsYXRpb246Y29uZmx1ZW5jZSB3cml0ZTpncm91cDpjb25mbHVlbmNlIHJlYWQ6Y29udGVudC5wcm9wZXJ0eTpjb25mbHVlbmNlIGRlbGV0ZTpibG9ncG9zdDpjb25mbHVlbmNlIGRlbGV0ZTpjdXN0b20tY29udGVudDpjb25mbHVlbmNlIG9mZmxpbmVfYWNjZXNzIHJlYWQ6cmVsYXRpb246Y29uZmx1ZW5jZSByZWFkOnVzZXI6Y29uZmx1ZW5jZSB3cml0ZTphdWRpdC1sb2c6Y29uZmx1ZW5jZSByZWFkOmNvbnRlbnQtZGV0YWlsczpjb25mbHVlbmNlIHdyaXRlOmNvbmZpZ3VyYXRpb246Y29uZmx1ZW5jZSB3cml0ZTpjb250ZW50LnByb3BlcnR5OmNvbmZsdWVuY2Ugd3JpdGU6cGFnZTpjb25mbHVlbmNlIHdyaXRlOmNvbW1lbnQ6Y29uZmx1ZW5jZSB3cml0ZTpzcGFjZS5wcm9wZXJ0eTpjb25mbHVlbmNlIGRlbGV0ZTpjb250ZW50OmNvbmZsdWVuY2UgcmVhZDpjb250ZW50LnJlc3RyaWN0aW9uOmNvbmZsdWVuY2UgcmVhZDpjb250ZW50LnBlcm1pc3Npb246Y29uZmx1ZW5jZSByZWFkOmF1ZGl0LWxvZzpjb25mbHVlbmNlIiwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tLzNsbyI6dHJ1ZSwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL29hdXRoQ2xpZW50SWQiOiJ3NEkzcHFxTjVidEdvU1lGN1RGQ1JqWTY4aUFqQ3JMcCIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9lbWFpbERvbWFpbiI6ImdtYWlsLmNvbSIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9zeXN0ZW1BY2NvdW50RW1haWxEb21haW4iOiJjb25uZWN0LmF0bGFzc2lhbi5jb20iLCJodHRwczovL2F0bGFzc2lhbi5jb20vZmlyc3RQYXJ0eSI6ZmFsc2UsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9zeXN0ZW1BY2NvdW50SWQiOiI2MmZhZTMyZjZkMjY2MzI4ODlkZGRhMmQifQ.TyWtO5PeP0fbaoIW1WFcvuFhAI1TAfcrkGl1sHxiAz1ZbUW3r-RjgArKzkd7XRNNOOq7_ALk99smDxeHx8xYMhzCeVoSEaEWhNvGZSUOxxzUa_TuG1Kp30IKDSlcDMbDDKzgRDKeUHrH9AV6xAlWw8WP4-tJmwcEPXmBB8i_V-AHRif-llm9CcwmkAT409fhjKjQWRh1hSW3LwOBxr8V75t5mX48wzVGTLRMhhfpXp0EKYKRWGUDwR-R5gSW8Sf4QGwwmttdGvFaR4mIIsdAHm2eNgtb3hV7q-rgO5afLmc4M6ln0rNJvtS8OrWQNKqim_1YKyM735_5NjIFFbQn1g',
                'Accept': 'application/json',
                'X-Atlassian-Token': 'no-check'
            },
            data: {
                'space': {
                    'key': 'Test'
                },
                'type': 'page',
                'title': `${editorData[0].text}`,
                'body': {
                    'wiki': {
                        'value': `${pageContentArray.join('\n')}`,
                         'representation': 'wiki'
                    }
                }
            }
          })
          .then(() => {
            notify("Successfully added to your Confluence")
          })
          .catch((err) => {
            notify(err.message)
          });
        }
  }, [editorData])

  return(
    <div>
        <div
          className={editorStyles.editor}
          style={{ border: "1px solid gray", "borderRadius": "8px", minHeight: "6em", cursor: "text",  "margin": "25px", "padding": "20px" }}
        >
            <Editor editorState={editorState} onChange={setEditorState}  plugins={plugins} />
            <Toolbar />
            <button className={editorStyles.btn} onClick={onButtonClick}>Create new confluence page</button>
        </div>
        <ToastContainer />
    </div>
  ) 
};