import React from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Title from './Title';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import StarIcon from "@material-ui/icons/Star";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import Box from "@material-ui/core/Box";
import Alert from "@material-ui/lab/Alert";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import CircularProgress from "@material-ui/core/CircularProgress";
//utilities
import { useAuth } from '../util/auth';
import { useRouter } from '../util/router';
import { updateActivity, deleteActivity, useActivitiesByOwner } from '../util/db';

// Generate Order Data
function createData(id, date, name, shipTo, paymentMethod, amount) {
  return { id, date, name, shipTo, paymentMethod, amount };
}

const rows = [
  createData(0, '16 Mar, 2019', 'Elvis Presley', 'Tupelo, MS', 'VISA ⠀•••• 3719', 312.44),
  createData(1, '16 Mar, 2019', 'Paul McCartney', 'London, UK', 'VISA ⠀•••• 2574', 866.99),
  createData(2, '16 Mar, 2019', 'Tom Scholz', 'Boston, MA', 'MC ⠀•••• 1253', 100.81),
  createData(3, '16 Mar, 2019', 'Michael Jackson', 'Gary, IN', 'AMEX ⠀•••• 2000', 654.39),
  createData(4, '15 Mar, 2019', 'Bruce Springsteen', 'Long Branch, NJ', 'VISA ⠀•••• 5919', 212.79),
];



function preventDefault(event) {
  event.preventDefault();
}

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  paperItems: {
    // minHeight: "300px",
  },
}));

export default function ActivitiyLog(props) {
  const classes = useStyles();
  const auth = useAuth();
  const router = useRouter();
  const month = new Date().getMonth();
  const date = new Date().getDate();
  const {
    data: activitiesData,
    status: activitiesStatus,
    error: activitiesError
  } = useActivitiesByOwner(auth.user.uid);

  const [updatingActivityId, setUpdatingActivityId] = React.useState(null);
  
  const activitiesAreEmpty = !activitiesData || activitiesData.length === 0;

  const canUseStar =
    auth.user.planIsActive &&
    (auth.user.planId === "pro" || auth.user.planId === "business");

  const handleStarItem = (activity) => {
    if (canUseStar) {
      updateActivity(activity.id, { featured: !activity.featured });
    } else {
      alert("You must upgrade to the pro or business plan to use this feature");
    }
  };

  return (
    <React.Fragment>
      <Title>Activities on {(month + 1) + " - " + date}</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell align="right">Duration</TableCell>
          </TableRow>
        </TableHead>

      <Paper className={classes.paperItems}>
        {(activitiesStatus === "loading" || activitiesAreEmpty) && (
          <Box py={5} px={3} align="center">
            {activitiesStatus === "loading" && <CircularProgress size={32} />}

            {activitiesStatus !== "loading" && activitiesAreEmpty && (
              <>Nothing yet. Click the button to add your first item.</>
            )}
          </Box>
        )}

        {activitiesStatus !== "loading" && activitiesData && activitiesData.length > 0 && (
          <List disablePadding={true}>
            {activitiesData
              .filter(activity => activity.date === new Date(props.date).getDate())
              .map((activity, index) => (
                <ListItem
                  key={index}
                  divider={index !== activitiesData.length - 1}
                  className={classes.featured && classes.featured}
                >
                  <ListItemText>{activity.name}</ListItemText>
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="star"
                      onClick={() => handleStarItem(activity)}
                      className={activity.featured && classes.starFeatured}
                    >
                      <StarIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="update"
                      onClick={() => setUpdatingActivityId(activity.id)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => deleteActivity(activity.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
            ))}
          </List>
        )}
      </Paper>

        <TableBody>
          {activitiesData ? activitiesData.map((activity) => (
            <TableRow key={activity.id}>
              <TableCell>{activity.name}</TableCell>
              <TableCell>{activity.type}</TableCell>
              <TableCell>{activity.duration}</TableCell>
            </TableRow>
          )) : "No activities added yet."}
        </TableBody>
      </Table>
      {activitiesData && ( activitiesData.length > 5 ) &&
        <div className={classes.seeMore}>
          <Link color="primary" href="#" onClick={preventDefault}>
            See more Activities
          </Link>
        </div>
      }
    </React.Fragment>
  );
}