import { useState, useEffect } from 'react';
import './App.scss';
import MyEditor from './DraftTextEditor/draft';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageId, setPageId] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [pageContent, setPageContent] = useState();

  // pageId: 'd7428927-e66a-436e-ae34-f3eb475ed13b';

  useEffect(() => {
    Promise.all([getQueryFromBackend(), getQueryDetailsFromBackend()])
    .then(([first, second]) => {
      setPageTitle(first);
      setPageContent(second.results);
    })
     // eslint-disable-next-line
  }, [pageId])

  const getQueryFromBackend = async () => {
    const response = await fetch(`http://localhost:5000/query/${pageId}`)
    const searchedQuery = await response.json()
    const title = (searchedQuery.child_page.title);
    return title;
  }

  const getQueryDetailsFromBackend = async () => {
    const res = await fetch(`http://localhost:5000/query/${pageId}/children`)
    const searchedQueryDetails = await res.json()
    return searchedQueryDetails;
  }

  const onSearchClick = () => {
    setPageId(searchTerm);
  }

  const onInputChange = (event) => {
    setSearchTerm(event.target.value);
  }

  return (
    <div className="App">
      <div className="wrap">
        <div className="search">
        <input
          type="text"
          className="searchTerm"
          placeholder="Enter notion page id here"
          value={searchTerm}
          onChange={onInputChange}
        />
        <button type="submit" className="searchButton" onClick={onSearchClick}>
          SEARCH
        </button>
        </div>
      </div>
      <MyEditor title = {pageTitle} pagecontents={pageContent} />
    </div>
  );
}

export default App;
