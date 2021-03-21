import React, { useState } from "react";
import Box from "@material-ui/core/Box";
import Alert from "@material-ui/lab/Alert";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import MenuItem from '@material-ui/core/MenuItem';
import Slider from '@material-ui/core/Slider';
import { useAuth } from "../util/auth.js";
import { useForm } from "react-hook-form";
import { createActivity, updateActivity, deleteActivity, useActivitiesByOwner } from "../util/db.js";
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

  const date = new Date(props.date).getDate();
  const [pending, setPending] = useState(false);
  const [formAlert, setFormAlert] = useState(null);
  const [type, setType] = React.useState('Weight Lifting');

  const handleChange = (event) => {
    setType(event.target.value);
  };

  const { register, handleSubmit, errors } = useForm();

  // This will fetch activity if props.id is defined
  // Otherwise query does nothing and we assume
  // we are creating a new activity.

  // If we are updating an existing activity
  // don't show modal until activity data is fetched.
  if (props.id && activitiesStatus !== "success") {
    return null;
  }

  const onSubmit = (data) => {
    setPending(true);

    const query = props.id
      ? updateActivity(props.id, data)
      : createActivity({ owner: auth.user.id, date: date, ...data });

    query
      .then(() => {
        // Let parent know we're done so they can hide modal
        props.onDone();
      })
      .catch((error) => {
        // Hide pending indicator
        setPending(false);
        // Show error alert message
        setFormAlert({
          type: "error",
          message: error.message,
        });
      });
  };

  const types = [
    {
      value: 'Weight Lifting'
    },
    {
      value: 'Cardio'
    },
    {
      value: 'Walking'
    },
    {
      value: 'Running'
    },
    {
      value: 'Biking'
    },
  ];

  function valuetext(value) {
    return value;
  }


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
        </Box>
        <Divider />
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container={true} spacing={3}>
            <Grid item={true} xs={12}>
              <TextField
                variant="outlined"
                type="text"
                label="Activity Name"
                name="name"
                defaultValue={activities && activities.name}
                error={errors.name ? true : false}
                helperText={errors.name && errors.name.message}
                fullWidth={true}
                autoFocus={true}
                inputRef={register({
                  required: "Please enter a name",
                })}
              />
              <Grid item={true} xs={12}>
                <TextField
                  select
                  label="Type"
                  fullWidth={true}
                  defaultValue={types[0].value}
                  value={type}
                  name={type}
                  onChange={handleChange}
                  error={errors.name ? true : false}
                helperText={errors.name && errors.name.message}
                  inputRef={register}
                >
                  {types.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.value}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item={true} xs={12}>
                <Typography gutterBottom>
                  Duration
                </Typography>
                <Slider
                  defaultValue={0.00000005}
                  getAriaValueText={valuetext}
                  aria-labelledby="discrete-slider-small-steps"
                  step={0.00000001}
                  marks
                  min={-0.00000005}
                  max={0.0000001}
                  valueLabelDisplay="auto"
                  fullWidth={true}
                  error={errors.name ? true : false}
                  helperText={errors.name && errors.name.message}
                  inputRef={register}
                />
              </Grid>
            </Grid>
            <Grid item={true} xs={12} justify="center" alignItems="center">
              <Button
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                disabled={pending}
              >
                {!pending && <span>Add Activity</span>}

                {pending && <CircularProgress size={28} />}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  );
}

export default DashboardActivities;
