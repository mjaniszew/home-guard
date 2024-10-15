import { useNavigate } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import { useCams } from '../../api/monitoring.js';
import { useUserHomes } from '../../api/home.js';

const CamsList = () => {
  const cams = useCams();
  const userHomes = useUserHomes();
  const navigate = useNavigate();
  const onCamSelect = (camId: string) => {
    navigate(`/cam/${camId}`);
  }

  if (cams.isPending || userHomes.isPending) {
    return <span>Loading cams data...</span>;
  }

  if (cams.isError || userHomes.isError) {
    return <span>Error: {cams.error?.message || userHomes.error?.message}</span>
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          Monitoring cams
        </Typography>
        <Table>
          <TableBody>
            {cams.data?.map((camera, index) => (
              <TableRow 
                hover
                sx={{ cursor: 'pointer' }}
                key={index} 
                onClick={(event) => {
                  event.preventDefault();
                  onCamSelect(camera.name);
                }
              }>
                <TableCell component="th" scope="row">
                  <Link href={`/cam/${camera.name}`}>
                    {camera.name}
                  </Link>
                </TableCell>
                <TableCell align="right">
                  {camera.active ? 
                    <Chip label="Online" color="success" icon={<VideocamIcon />} /> : 
                    <Chip label="Offline" color="error" icon={<VideocamOffIcon />} />
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export { CamsList };