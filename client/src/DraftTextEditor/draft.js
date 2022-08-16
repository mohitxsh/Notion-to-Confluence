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
        ${arrayPara.join('<br>')}
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
                'Authorization': 'Bearer eyJraWQiOiJmZTM2ZThkMzZjMTA2N2RjYTgyNTg5MmEiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2MmY4ZjEzMGQ3NWY1MjNhNjBlZDJmYTgiLCJuYmYiOjE2NjA2NjEwNzQsImlzcyI6Imh0dHBzOi8vYXRsYXNzaWFuLWFjY291bnQtcHJvZC5wdXMyLmF1dGgwLmNvbS8iLCJpYXQiOjE2NjA2NjEwNzQsImV4cCI6MTY2MDY2NDY3NCwiYXVkIjoidzRJM3BxcU41YnRHb1NZRjdURkNSalk2OGlBakNyTHAiLCJqdGkiOiI5OTcwZmE5Yi0xOTFhLTQxMjItYmFmNy0wNDNhNDJlOWYxZDQiLCJodHRwczovL2F0bGFzc2lhbi5jb20vdmVyaWZpZWQiOnRydWUsInZlcmlmaWVkIjoidHJ1ZSIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9zZXNzaW9uX2lkIjoiZWYwYmY1MDAtN2E5Ni00M2IyLTgxZmYtNzk4YzI2NDVlMjgxIiwiY2xpZW50X2lkIjoidzRJM3BxcU41YnRHb1NZRjdURkNSalk2OGlBakNyTHAiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vcmVmcmVzaF9jaGFpbl9pZCI6Inc0STNwcXFONWJ0R29TWUY3VEZDUmpZNjhpQWpDckxwLTYyZjhmMTMwZDc1ZjUyM2E2MGVkMmZhOC1kNGYyMWYyYi1lODgwLTQxOTUtOTIxMS01MmI4NDBlNGIwMDUiLCJodHRwczovL2F0bGFzc2lhbi5jb20vc3lzdGVtQWNjb3VudEVtYWlsIjoiYzE4MWRiYzAtNmMwMS00YjE4LTg1ZTgtY2I1NTJkNGI2NmZjQGNvbm5lY3QuYXRsYXNzaWFuLmNvbSIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS91anQiOiI4N2Q2ODMzNi1mNmU3LTQ3MDgtYjc2Mi1iYmM1NDRjM2U0ZDEiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vdmVyaWZpZWQiOiJ0cnVlIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL2F0bF90b2tlbl90eXBlIjoiQUNDRVNTIiwic2NvcGUiOiJkZWxldGU6YXR0YWNobWVudDpjb25mbHVlbmNlIGRlbGV0ZTpibG9ncG9zdDpjb25mbHVlbmNlIGRlbGV0ZTpjb21tZW50OmNvbmZsdWVuY2UgZGVsZXRlOmNvbnRlbnQ6Y29uZmx1ZW5jZSBkZWxldGU6Y3VzdG9tLWNvbnRlbnQ6Y29uZmx1ZW5jZSBkZWxldGU6cGFnZTpjb25mbHVlbmNlIGRlbGV0ZTpzcGFjZTpjb25mbHVlbmNlIG9mZmxpbmVfYWNjZXNzIHJlYWQ6YW5hbHl0aWNzLmNvbnRlbnQ6Y29uZmx1ZW5jZSByZWFkOmF0dGFjaG1lbnQ6Y29uZmx1ZW5jZSByZWFkOmF1ZGl0LWxvZzpjb25mbHVlbmNlIHJlYWQ6YmxvZ3Bvc3Q6Y29uZmx1ZW5jZSByZWFkOmNvbW1lbnQ6Y29uZmx1ZW5jZSByZWFkOmNvbmZpZ3VyYXRpb246Y29uZmx1ZW5jZSByZWFkOmNvbnRlbnQtZGV0YWlsczpjb25mbHVlbmNlIHJlYWQ6Y29udGVudC5tZXRhZGF0YTpjb25mbHVlbmNlIHJlYWQ6Y29udGVudC5wZXJtaXNzaW9uOmNvbmZsdWVuY2UgcmVhZDpjb250ZW50LnByb3BlcnR5OmNvbmZsdWVuY2UgcmVhZDpjb250ZW50LnJlc3RyaWN0aW9uOmNvbmZsdWVuY2UgcmVhZDpjb250ZW50OmNvbmZsdWVuY2UgcmVhZDpjdXN0b20tY29udGVudDpjb25mbHVlbmNlIHJlYWQ6Z3JvdXA6Y29uZmx1ZW5jZSByZWFkOmlubGluZXRhc2s6Y29uZmx1ZW5jZSByZWFkOmxhYmVsOmNvbmZsdWVuY2UgcmVhZDpwYWdlOmNvbmZsdWVuY2UgcmVhZDpyZWxhdGlvbjpjb25mbHVlbmNlIHJlYWQ6c3BhY2UtZGV0YWlsczpjb25mbHVlbmNlIHJlYWQ6c3BhY2UucGVybWlzc2lvbjpjb25mbHVlbmNlIHJlYWQ6c3BhY2UucHJvcGVydHk6Y29uZmx1ZW5jZSByZWFkOnNwYWNlLnNldHRpbmc6Y29uZmx1ZW5jZSByZWFkOnNwYWNlOmNvbmZsdWVuY2UgcmVhZDp0ZW1wbGF0ZTpjb25mbHVlbmNlIHJlYWQ6dXNlci5wcm9wZXJ0eTpjb25mbHVlbmNlIHJlYWQ6dXNlcjpjb25mbHVlbmNlIHJlYWQ6d2F0Y2hlcjpjb25mbHVlbmNlIHdyaXRlOmF0dGFjaG1lbnQ6Y29uZmx1ZW5jZSB3cml0ZTphdWRpdC1sb2c6Y29uZmx1ZW5jZSB3cml0ZTpibG9ncG9zdDpjb25mbHVlbmNlIHdyaXRlOmNvbW1lbnQ6Y29uZmx1ZW5jZSB3cml0ZTpjb25maWd1cmF0aW9uOmNvbmZsdWVuY2Ugd3JpdGU6Y29udGVudC5wcm9wZXJ0eTpjb25mbHVlbmNlIHdyaXRlOmNvbnRlbnQucmVzdHJpY3Rpb246Y29uZmx1ZW5jZSB3cml0ZTpjb250ZW50OmNvbmZsdWVuY2Ugd3JpdGU6Y3VzdG9tLWNvbnRlbnQ6Y29uZmx1ZW5jZSB3cml0ZTpncm91cDpjb25mbHVlbmNlIHdyaXRlOmlubGluZXRhc2s6Y29uZmx1ZW5jZSB3cml0ZTpsYWJlbDpjb25mbHVlbmNlIHdyaXRlOnBhZ2U6Y29uZmx1ZW5jZSB3cml0ZTpyZWxhdGlvbjpjb25mbHVlbmNlIHdyaXRlOnNwYWNlLnBlcm1pc3Npb246Y29uZmx1ZW5jZSB3cml0ZTpzcGFjZS5wcm9wZXJ0eTpjb25mbHVlbmNlIHdyaXRlOnNwYWNlLnNldHRpbmc6Y29uZmx1ZW5jZSB3cml0ZTpzcGFjZTpjb25mbHVlbmNlIHdyaXRlOnRlbXBsYXRlOmNvbmZsdWVuY2Ugd3JpdGU6dXNlci5wcm9wZXJ0eTpjb25mbHVlbmNlIHdyaXRlOndhdGNoZXI6Y29uZmx1ZW5jZSIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS8zbG8iOnRydWUsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9vYXV0aENsaWVudElkIjoidzRJM3BxcU41YnRHb1NZRjdURkNSalk2OGlBakNyTHAiLCJodHRwczovL2F0bGFzc2lhbi5jb20vZW1haWxEb21haW4iOiJnbWFpbC5jb20iLCJodHRwczovL2F0bGFzc2lhbi5jb20vc3lzdGVtQWNjb3VudEVtYWlsRG9tYWluIjoiY29ubmVjdC5hdGxhc3NpYW4uY29tIiwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL2ZpcnN0UGFydHkiOmZhbHNlLCJodHRwczovL2F0bGFzc2lhbi5jb20vc3lzdGVtQWNjb3VudElkIjoiNjJmYWUzMmY2ZDI2NjMyODg5ZGRkYTJkIn0.GklbNp7-dz3FA1tO2DEY7v71PmWNVx3408GVvmbQ0NpUni7WDlTpq01inQXHUS10BGGLbhq-BRsne-CfFHVTy4w-zZMqYGlowP5BqMfPg_Um3iYNGNjc1F819FLdNsSEep9zOpZC8U66E9pfGJvSUbpoVMzZ88sEQqv8iu7aGZr0p9iqPU_SgSbSzTMrRq0LQ0r2OG0HCKVc_sMTa9wSp8lNNfBzQm6wzAge2EoHzzVhf7By3P8p-wL8oCWklLn7HPSS8Bx8pyPC5HRXbqRTLLVtcEBMmn2-CAUv-NeoZgO2LgG-aFy9JpV5EJkEBstrTSff6z-TdzFe8kCBQPQ27g',
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