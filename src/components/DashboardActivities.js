import React, { useState } from "react";
import Box from "@material-ui/core/Box";
import Alert from "@material-ui/lab/Alert";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import CircularProgress from "@material-ui/core/CircularProgress";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import StarIcon from "@material-ui/icons/Star";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import EditActivityModal from "./EditActivityModal";
import { useAuth } from "../util/auth.js";
import { updateActivity, deleteActivity, useActivitiesByOwner } from "../util/db.js";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  paperItems: {
    minHeight: "300px",
  },
  featured: {
    backgroundColor:
      theme.palette.type === "dark" ? theme.palette.action.selected : "#fdf8c2",
  },
  starFeatured: {
    color: theme.palette.warning.main,
  },
}));

function DashboardActivities(props) {
  const classes = useStyles();

  const auth = useAuth();

  const {
    data: activities,
    status: activitiesStatus,
    error: activitiesError,
  } = useActivitiesByOwner(auth.user.uid);

  const [creatingActivity, setCreatingActivity] = useState(false);

  const [updatingActivityId, setUpdatingActivityId] = useState(null);

  const activitiesAreEmpty = !activities || activities.length === 0;

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

  console.info(auth.user.uid, activities, activitiesError)
  return (
    <>
      {activitiesError && (
        <Box mb={3}>
          <Alert severity="error">{activitiesError.message}</Alert>
        </Box>
      )}

      <Paper className={classes.paperItems}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          padding={2}
        >
          <Typography className={classes.text} variant="h6">
            Add activity on <br/>
            <center>
              {( new Date().getMonth() + 1 ) + " - " + new Date(props.date).getDate() }
            </center>
          </Typography>
          <Button
            variant="contained"
            size="medium"
            color="primary"
            onClick={() => setCreatingActivity(true)}
          >
            Add Activity
          </Button>
        </Box>
        <Divider />

        {(activitiesStatus === "loading" || activitiesAreEmpty) && (
          <Box py={5} px={3} align="center">
            {activitiesStatus === "loading" && <CircularProgress size={32} />}

            {activitiesStatus !== "loading" && activitiesAreEmpty && (
              <>Nothing yet. Click the button to add your first item.</>
            )}
          </Box>
        )}

        {activitiesStatus !== "loading" && activities && activities.length > 0 && (
          <List disablePadding={true}>
            {activities
              .filter(activity => activity.date === new Date(props.date).getDate())
              .map((activity, index) => (
                <ListItem
                  key={index}
                  divider={index !== activities.length - 1}
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

      {creatingActivity && <EditActivityModal date={props.date} onDone={() => setCreatingActivity(false)} />}

      {updatingActivityId && (
        <EditActivityModal
          id={updatingActivityId}
          date={props.date}
          onDone={() => setUpdatingActivityId(null)}
        />
      )}
    </>
  );
}

export default DashboardActivities;
