// const [usersData, setUsersData] = useState<Users[]>(mockUsersData); // State for users data
// const [loading, setLoading] = useState<boolean>(true); // Loading state
// const [error, setError] = useState<string | null>(null); // Error state

// useEffect(() => {
//   const fetchData = async () => {
//     try {
//       const response = await fetch('/mocks/Users.json');
//       if (!response.ok) {
//         throw new Error('Failed to fetch data');
//       }
//       const data = await response.json();
//       setUsersData(data);
//       setLoading(false);
//     } catch (error) {
//       // setError(error.message || 'Failed to fetch data');
//       setLoading(false);
//     }
//   };

//   fetchData();
// }, []);