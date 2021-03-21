import React, { useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Box from "@material-ui/core/Box";
import Alert from "@material-ui/lab/Alert";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useAuth } from "../util/auth.js";
import { useForm } from "react-hook-form";
import { useActivity, updateActivity, createActivity } from "../util/db.js";
import { makeStyles } from "@material-ui/core/styles";

import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import Slider from '@material-ui/core/Slider';

const useStyles = makeStyles((theme) => ({
  content: {
    paddingBottom: 24,
  },
}));

function EditActivityModal(props) {
  const classes = useStyles();

  const auth = useAuth();
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
  const { data: activityData, status: activityStatus } = useActivity(props.id);

  // If we are updating an existing activity
  // don't show modal until activity data is fetched.
  if (props.id && activityStatus !== "success") {
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
    <Dialog open={true} onClose={props.onDone}>
      <DialogTitle>
        {props.id && <>Update</>}
        {!props.id && <>Create</>}
        {` `}Activity
      </DialogTitle>
      <DialogContent className={classes.content}>
        {formAlert && (
          <Box mb={4}>
            <Alert severity={formAlert.type}>{formAlert.message}</Alert>
          </Box>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container={true} spacing={3}>
            <Grid item={true} xs={12}>
              <TextField
                variant="outlined"
                type="text"
                label="Activity Name"
                name="name"
                defaultValue={activityData && activityData.name}
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
                  onChange={handleChange}
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
                />
              </Grid>
            </Grid>
            <Grid item={true} xs={12}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                disabled={pending}
              >
                {!pending && <span>Save</span>}

                {pending && <CircularProgress size={28} />}
              </Button>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditActivityModal;
